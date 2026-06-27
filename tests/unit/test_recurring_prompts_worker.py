import importlib.util
import pathlib
import sys
import unittest
from types import SimpleNamespace
from unittest import mock

MODULE_PATH = pathlib.Path(__file__).resolve().parents[2] / "scripts" / "recurring_prompts_worker.py"
spec = importlib.util.spec_from_file_location("recurring_prompts_worker", MODULE_PATH)
worker = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules[spec.name] = worker
spec.loader.exec_module(worker)


def args(**overrides):
    values = {
        "base_url": "http://127.0.0.1:5173",
        "admin_password": "",
        "cookie": "clawnsole_auth=test",
        "timeout": 15,
        "retries": 2,
        "backoff": 1.0,
        "max_backoff": 10.0,
        "dry_run": False,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class RecurringPromptsWorkerTests(unittest.TestCase):
    def test_trigger_prompt_uses_stable_idempotency_key_for_scheduled_slot(self):
        calls = []

        def fake_request(base_url, method, path, *, data=None, headers=None, timeout=15):
            calls.append((base_url, method, path, data, headers, timeout))
            return 200, {"ok": True}, {}

        prompt = {"id": "p1", "nextRunAt": 1234}
        with mock.patch.object(worker, "_json_request", side_effect=fake_request):
            result = worker._trigger_prompt("http://clawnsole", "cookie=1", prompt, 9999, 15, True)

        self.assertTrue(result["ok"])
        self.assertEqual(calls[0][2], "/api/recurring-prompts/p1/trigger")
        self.assertEqual(calls[0][3]["scheduledAt"], 1234)
        self.assertEqual(calls[0][3]["idempotencyKey"], "p1:1234")
        self.assertEqual(calls[0][3]["dryRun"], True)
        self.assertEqual(calls[0][4]["Idempotency-Key"], "p1:1234")

    def test_run_once_filters_due_prompts_and_skips_future_disabled(self):
        prompts = [
            {"id": "due", "enabled": True, "nextRunAt": 1_700_000_000_000},
            {"id": "future", "enabled": True, "nextRunAt": 1_700_000_060_000},
            {"id": "disabled", "enabled": False, "nextRunAt": 1_700_000_000_000},
        ]
        triggered = []

        def fake_trigger(base_url, cookie, prompt, now_ms, timeout, dry_run):
            triggered.append(prompt["id"])
            return {"ok": True, "duplicate": False}

        with (
            mock.patch.object(worker.time, "time", return_value=1_700_000_030),
            mock.patch.object(worker, "_load_prompts", return_value=prompts),
            mock.patch.object(worker, "_trigger_prompt", side_effect=fake_trigger),
        ):
            result = worker.run_once(args())

        self.assertEqual(result["ok"], True)
        self.assertEqual(result["due"], 1)
        self.assertEqual(result["delivered"], 1)
        self.assertEqual(triggered, ["due"])

    def test_run_once_retries_failed_trigger_then_succeeds(self):
        outcomes = [{"ok": False, "error": "bad gateway", "status": 502}, {"ok": True, "duplicate": True}]

        with (
            mock.patch.object(worker, "_load_prompts", return_value=[{"id": "due", "nextRunAt": 1}]),
            mock.patch.object(worker, "_trigger_prompt", side_effect=lambda *a: outcomes.pop(0)),
            mock.patch.object(worker.time, "sleep") as sleep_mock,
        ):
            result = worker.run_once(args(retries=1, backoff=0.25))

        self.assertEqual(result["ok"], True)
        self.assertEqual(result["delivered"], 1)
        self.assertEqual(result["duplicates"], 1)
        sleep_mock.assert_called_once_with(0.25)


if __name__ == "__main__":
    unittest.main()

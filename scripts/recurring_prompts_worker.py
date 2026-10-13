#!/usr/bin/env python3
"""External worker for Clawnsole recurring admin prompts.

This process is intentionally outside OpenClaw Gateway scheduling. It polls
Clawnsole for due prompts and asks Clawnsole to trigger each delivery, so
credentials and delivery behavior stay server-owned.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


def _json_request(base_url: str, method: str, path: str, *, data=None, headers=None, timeout=15):
    url = urllib.parse.urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))
    body = None
    req_headers = {"Accept": "application/json"}
    if headers:
        req_headers.update(headers)
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        req_headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw or "{}"), resp.headers
    except urllib.error.HTTPError as err:
        raw = err.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw or "{}")
        except json.JSONDecodeError:
            payload = {"error": raw or str(err)}
        return err.code, payload, err.headers
    except urllib.error.URLError as err:
        return 0, {"error": str(getattr(err, "reason", err))}, {}
    except (TimeoutError, OSError) as err:
        return 0, {"error": str(err) or "request failed"}, {}


def _login(base_url: str, password: str, timeout: int) -> str:
    status, payload, headers = _json_request(
        base_url,
        "POST",
        "/auth/login",
        data={"password": password},
        timeout=timeout,
    )
    if status != 200:
        raise RuntimeError(f"login failed: HTTP {status} {payload.get('error', '')}".strip())
    cookies = headers.get_all("Set-Cookie") if hasattr(headers, "get_all") else headers.get("Set-Cookie", "").split(",")
    cookie_pairs = []
    for cookie in cookies or []:
        pair = str(cookie).split(";", 1)[0].strip()
        if pair:
            cookie_pairs.append(pair)
    if not cookie_pairs:
        raise RuntimeError("login failed: missing auth cookie")
    return "; ".join(cookie_pairs)


def _load_prompts(base_url: str, cookie: str, timeout: int):
    status, payload, _ = _json_request(
        base_url,
        "GET",
        "/api/recurring-prompts",
        headers={"Cookie": cookie},
        timeout=timeout,
    )
    if status != 200:
        raise RuntimeError(f"prompt poll failed: HTTP {status} {payload.get('error', '')}".strip())
    prompts = payload.get("prompts", [])
    return prompts if isinstance(prompts, list) else []


def _trigger_prompt(base_url: str, cookie: str, prompt: dict, now_ms: int, timeout: int, dry_run: bool, device_label: str):
    prompt_id = str(prompt.get("id") or "").strip()
    if not prompt_id:
        return {"ok": False, "error": "missing prompt id"}
    scheduled_at = prompt.get("nextRunAt") or prompt.get("nextRun") or now_ms
    try:
        scheduled_at = int(float(scheduled_at))
    except (TypeError, ValueError):
        scheduled_at = now_ms
    idempotency_key = f"{prompt_id}:{scheduled_at}"
    status, payload, _ = _json_request(
        base_url,
        "POST",
        f"/api/recurring-prompts/{urllib.parse.quote(prompt_id)}/trigger",
        data={
            "scheduledAt": scheduled_at,
            "idempotencyKey": idempotency_key,
            "deviceLabel": device_label,
            "dryRun": dry_run,
        },
        headers={"Cookie": cookie, "Idempotency-Key": idempotency_key},
        timeout=timeout,
    )
    return {
        "ok": status == 200 and bool(payload.get("ok")),
        "status": status,
        "duplicate": bool(payload.get("duplicate")),
        "error": payload.get("error") or "",
        "id": prompt_id,
    }


def run_once(args) -> dict:
    password = args.admin_password or os.environ.get("CLAWNSOLE_ADMIN_PASSWORD", "")
    cookie = args.cookie or os.environ.get("CLAWNSOLE_ADMIN_COOKIE", "")
    if not cookie:
        if not password:
            raise RuntimeError("set --admin-password, CLAWNSOLE_ADMIN_PASSWORD, or CLAWNSOLE_ADMIN_COOKIE")
        cookie = _login(args.base_url, password, args.timeout)

    now_ms = int(time.time() * 1000)
    prompts = _load_prompts(args.base_url, cookie, args.timeout)
    due = []
    for prompt in prompts:
        if not isinstance(prompt, dict) or prompt.get("enabled") is False:
            continue
        next_run = prompt.get("nextRunAt") or prompt.get("nextRun") or 0
        try:
            next_run_ms = int(float(next_run))
        except (TypeError, ValueError):
            next_run_ms = 0
        if next_run_ms <= now_ms:
            due.append(prompt)

    delivered = 0
    duplicates = 0
    errors = []
    for prompt in due:
        last_error = None
        for attempt in range(args.retries + 1):
            result = _trigger_prompt(
                args.base_url,
                cookie,
                prompt,
                now_ms,
                args.timeout,
                args.dry_run,
                args.device_label,
            )
            if result.get("ok"):
                delivered += 1
                if result.get("duplicate"):
                    duplicates += 1
                break
            last_error = result.get("error") or f"HTTP {result.get('status')}"
            if attempt < args.retries:
                time.sleep(min(args.max_backoff, args.backoff * (2**attempt)))
        else:
            errors.append({"id": prompt.get("id"), "error": last_error or "trigger failed"})

    return {
        "ok": not errors,
        "due": len(due),
        "delivered": delivered,
        "duplicates": duplicates,
        "errors": errors,
    }


def parse_args(argv):
    parser = argparse.ArgumentParser(description="Run Clawnsole recurring admin prompts externally.")
    parser.add_argument("--base-url", default=os.environ.get("CLAWNSOLE_BASE_URL", "http://127.0.0.1:5173"))
    parser.add_argument("--admin-password", default="")
    parser.add_argument("--cookie", default="")
    parser.add_argument("--once", action="store_true", help="Run one poll/trigger pass and exit.")
    parser.add_argument("--loop-seconds", type=int, default=60)
    parser.add_argument("--timeout", type=int, default=15)
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--backoff", type=float, default=1.0)
    parser.add_argument("--max-backoff", type=float, default=10.0)
    parser.add_argument("--device-label", default=os.environ.get("CLAWNSOLE_WORKER_DEVICE_LABEL", "python-worker"))
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv or sys.argv[1:])
    while True:
        try:
            result = run_once(args)
        except Exception as err:  # noqa: BLE001 - CLI should report concise failures.
            print(json.dumps({"ok": False, "error": str(err)}), flush=True)
            if args.once:
                return 1
        else:
            print(json.dumps(result, separators=(",", ":")), flush=True)
            if args.once:
                return 0 if result.get("ok") else 1
        time.sleep(max(5, args.loop_seconds))


if __name__ == "__main__":
    raise SystemExit(main())

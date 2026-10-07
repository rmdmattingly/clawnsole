#!/usr/bin/env python3
"""
External scheduler worker for recurring prompts.

Runs independently (launchd/systemd/cron friendly) and delegates each delivery
tick to the Node scheduler with retry/backoff.
"""

from __future__ import annotations

import argparse
import json
import os
import random
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def log(event: str, **fields: object) -> None:
    payload = {"ts": utc_now(), "event": event, **fields}
    print(json.dumps(payload, separators=(",", ":")), flush=True)


@dataclass
class RunnerConfig:
    node_bin: str
    scheduler_js: str
    prompts_path: Optional[str]
    openclaw_config: Optional[str]
    device_label: str
    dry_run: bool
    max_retries: int
    backoff_base_seconds: float
    backoff_jitter_seconds: float
    loop_seconds: int
    once: bool


def build_tick_cmd(cfg: RunnerConfig) -> list[str]:
    cmd = [cfg.node_bin, cfg.scheduler_js, "--once", "--deviceLabel", cfg.device_label]
    if cfg.prompts_path:
        cmd.extend(["--promptsPath", cfg.prompts_path])
    if cfg.openclaw_config:
        cmd.extend(["--openclawConfig", cfg.openclaw_config])
    if cfg.dry_run:
        cmd.append("--dryRun")
    return cmd


def run_tick(cfg: RunnerConfig) -> bool:
    cmd = build_tick_cmd(cfg)
    for attempt in range(0, max(0, cfg.max_retries) + 1):
        started = time.time()
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        elapsed_ms = int((time.time() - started) * 1000)
        output = (proc.stdout or "").strip() or (proc.stderr or "").strip()
        if proc.returncode == 0:
            log("tick_ok", attempt=attempt, elapsedMs=elapsed_ms, output=output)
            return True
        if attempt >= cfg.max_retries:
            log("tick_failed", attempt=attempt, elapsedMs=elapsed_ms, code=proc.returncode, output=output)
            return False
        sleep_s = cfg.backoff_base_seconds * (2**attempt) + random.uniform(0, max(0.0, cfg.backoff_jitter_seconds))
        log("tick_retry", attempt=attempt, code=proc.returncode, sleepSeconds=round(sleep_s, 3), output=output)
        time.sleep(max(0.0, sleep_s))
    return False


def parse_args(argv: list[str]) -> RunnerConfig:
    parser = argparse.ArgumentParser(description="Recurring prompt external scheduler worker (Python)")
    parser.add_argument("--nodeBin", default=os.environ.get("NODE_BIN", "node"))
    parser.add_argument("--schedulerJs", default=str(Path(__file__).with_name("recurring-prompts-scheduler.js")))
    parser.add_argument("--promptsPath", default=os.environ.get("CLAWNSOLE_RECURRING_PROMPTS_PATH"))
    parser.add_argument("--openclawConfig", default=os.environ.get("OPENCLAW_CONFIG"))
    parser.add_argument("--deviceLabel", default="scheduler")
    parser.add_argument("--dryRun", action="store_true")
    parser.add_argument("--maxRetries", type=int, default=3)
    parser.add_argument("--backoffBaseSeconds", type=float, default=0.75)
    parser.add_argument("--backoffJitterSeconds", type=float, default=0.25)
    parser.add_argument("--loopSeconds", type=int, default=60)
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args(argv)
    return RunnerConfig(
        node_bin=args.nodeBin,
        scheduler_js=args.schedulerJs,
        prompts_path=args.promptsPath,
        openclaw_config=args.openclawConfig,
        device_label=args.deviceLabel,
        dry_run=args.dryRun,
        max_retries=max(0, args.maxRetries),
        backoff_base_seconds=max(0.0, args.backoffBaseSeconds),
        backoff_jitter_seconds=max(0.0, args.backoffJitterSeconds),
        loop_seconds=max(5, args.loopSeconds),
        once=bool(args.once),
    )


def main(argv: list[str]) -> int:
    cfg = parse_args(argv)
    if not Path(cfg.scheduler_js).exists():
        log("config_error", message="schedulerJs not found", schedulerJs=cfg.scheduler_js)
        return 2
    if cfg.once:
        return 0 if run_tick(cfg) else 1
    while True:
        run_tick(cfg)
        time.sleep(cfg.loop_seconds)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

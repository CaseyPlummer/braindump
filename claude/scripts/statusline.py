#!/usr/bin/env python3
"""Claude Code two-line status bar.

Line 1: cwd basename (cyan)  git branch (magenta/red + dirty *)  [session]
Line 2: thinking · effort · ctx% · 5h-limit · last-turn tokens · lines · cost · model

Example — line 2's emojis show literally; line 1 uses nerd-font folder/branch glyphs
(shown as 📁/🌿 here), and ANSI color renders only in the terminal, not in this file:

    📁 my-app    🌿 main    [wip]
    🧠 on   ⚡ high   📊 ctx 42%   ⏳ 5h 18% ·resets 3:00pm   ↑12.3k ↓4.5k   +120 -30   💰 $1.85   Opus 4.8

Color (terminal only):
    line 1   cwd cyan · branch magenta (red + "*" when dirty) · [session] dim
    line 2   ctx% / 5h%   green ≤50 · yellow ≤80 · red >80
             cost         dim-green ≤$2 · yellow ≤$10 · red >$10
             lines        +added green / −removed red   ·   tokens & model dim

Pure Python — no jq or bash dependency, so it runs anywhere Python 3 and git are on
PATH (Windows, macOS, Linux). Line 1's folder/branch glyphs need a Nerd Font installed
in the terminal.

Install (Claude Code only — this hooks into Claude Code's statusline mechanism):
    1. Save this file anywhere, e.g. ~/.claude/statusline.py
    2. In Claude Code's settings.json, add:
           "statusLine": { "type": "command", "command": "python /path/to/statusline.py" }
    3. Claude Code pipes session JSON to stdin on each refresh; the script prints the bar.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── ANSI ──────────────────────────────────────────────────────────────────────
RST = "\x1b[0m"
CYAN = "\x1b[36m"
MAG = "\x1b[35m"
RED = "\x1b[31m"
YEL = "\x1b[33m"
GRN = "\x1b[32m"
DIM = "\x1b[2m"
DIM_GRN = "\x1b[2;32m"


def get(d, *path, default=None):
    """Safely walk a dict path. Returns default if any step is missing/None."""
    cur = d
    for key in path:
        if not isinstance(cur, dict):
            return default
        cur = cur.get(key)
        if cur is None:
            return default
    return cur


def fmt_k(n) -> str:
    if n is None:
        return ""
    try:
        n = int(n)
    except (TypeError, ValueError):
        return ""
    if n == 0:
        return ""
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}k"
    return str(n)


def run(cmd: list[str], cwd: str | None = None) -> str:
    """Run a command, return stdout stripped, empty on any failure."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=2,
            check=False,
        )
        return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        return ""


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return

    cwd = get(data, "workspace", "current_dir") or get(data, "cwd") or ""
    transcript = get(data, "transcript_path") or ""
    model_name = get(data, "model", "display_name") or get(data, "model", "id") or ""
    session_name = get(data, "session_name") or ""

    # ── LINE 1 ────────────────────────────────────────────────────────────────
    base = os.path.basename(cwd) if cwd else ""
    line1_parts: list[str] = []
    if base:
        line1_parts.append(f"{CYAN} {base}{RST}")

    if cwd:
        branch = run(["git", "-C", cwd, "rev-parse", "--abbrev-ref", "HEAD"])
        if branch and branch != "HEAD":
            dirty = run(["git", "-C", cwd, "status", "--porcelain", "--no-lock-index"])
            if dirty:
                line1_parts.append(f"{RED} {branch}*{RST}")
            else:
                line1_parts.append(f"{MAG} {branch}{RST}")

    if session_name:
        line1_parts.append(f"{DIM}[{session_name}]{RST}")

    line1 = "  ".join(line1_parts)

    # ── LINE 2 ────────────────────────────────────────────────────────────────
    parts: list[str] = []

    # 1. Thinking mode
    thinking = get(data, "thinking", "enabled")
    if thinking is None:
        thinking = get(data, "thinking_mode")
    if thinking is True:
        parts.append("🧠 on")
    elif isinstance(thinking, str) and thinking and thinking not in (
        "false", "disabled", "default", "null"
    ):
        parts.append(f"🧠 {thinking}")

    # 2. Effort level — read from settings.json
    settings_path = Path.home() / ".claude" / "settings.json"
    if settings_path.is_file():
        try:
            with settings_path.open("r", encoding="utf-8") as f:
                settings = json.load(f)
            effort = settings.get("effortLevel")
            if effort:
                parts.append(f"⚡ {effort}")
        except (OSError, json.JSONDecodeError):
            pass

    # 3. Context percentage
    used_pct = get(data, "context_window", "used_percentage")
    if used_pct is not None:
        try:
            pct_int = round(float(used_pct))
            if pct_int > 80:
                color = RED
            elif pct_int > 50:
                color = YEL
            else:
                color = GRN
            parts.append(f"📊 {color}ctx {pct_int}%{RST}")
        except (TypeError, ValueError):
            pass

    # 4. 5-hour rate-limit window
    five_h_pct = get(data, "rate_limits", "five_hour", "used_percentage")
    five_h_reset = get(data, "rate_limits", "five_hour", "resets_at")
    if five_h_pct is not None:
        try:
            pct = round(float(five_h_pct))
            if pct > 80:
                color = RED
            elif pct > 50:
                color = YEL
            else:
                color = GRN
            seg = f"⏳ {color}5h {pct}%{RST}"
            if five_h_reset:
                try:
                    ts = datetime.fromtimestamp(int(five_h_reset))
                    reset_str = ts.strftime("%-I:%M%P") if hasattr(ts, "strftime") else ""
                    if not reset_str:
                        reset_str = ts.strftime("%I:%M%p").lstrip("0").lower()
                    seg += f" {DIM}·resets {reset_str}{RST}"
                except (TypeError, ValueError, OSError):
                    pass
            parts.append(seg)
        except (TypeError, ValueError):
            pass

    # 5. Last-turn tokens
    in_tok = get(data, "context_window", "current_usage", "input_tokens")
    out_tok = get(data, "context_window", "current_usage", "output_tokens")

    if in_tok is None and transcript and Path(transcript).is_file():
        try:
            with open(transcript, "rb") as f:
                f.seek(0, os.SEEK_END)
                size = f.tell()
                read_size = min(size, 256 * 1024)
                f.seek(size - read_size)
                tail = f.read().decode("utf-8", errors="replace")
            for line in reversed(tail.splitlines()):
                if '"input_tokens"' in line:
                    try:
                        obj = json.loads(line)
                        usage = (
                            get(obj, "message", "usage")
                            or get(obj, "usage")
                            or {}
                        )
                        if usage.get("input_tokens") is not None:
                            in_tok = usage.get("input_tokens")
                            out_tok = usage.get("output_tokens")
                            break
                    except (json.JSONDecodeError, ValueError):
                        continue
        except OSError:
            pass

    in_fmt = fmt_k(in_tok)
    out_fmt = fmt_k(out_tok)
    if in_fmt or out_fmt:
        seg = ""
        if in_fmt:
            seg += f"↑{in_fmt}"
        if out_fmt:
            seg += f" ↓{out_fmt}" if seg else f"↓{out_fmt}"
        parts.append(f"{DIM}{seg}{RST}")

    # 6. Lines changed
    added = get(data, "cost", "total_lines_added") or 0
    removed = get(data, "cost", "total_lines_removed") or 0
    try:
        added = int(added)
        removed = int(removed)
    except (TypeError, ValueError):
        added = removed = 0
    if added > 0 or removed > 0:
        seg = ""
        if added > 0:
            seg = f"{GRN}+{added}{RST}"
        if removed > 0:
            seg = f"{seg} {RED}-{removed}{RST}" if seg else f"{RED}-{removed}{RST}"
        parts.append(seg)

    # 7. Session cost
    cost = get(data, "cost", "total_cost_usd")
    if cost is not None:
        try:
            cost_val = float(cost)
            if cost_val > 10:
                color = RED
            elif cost_val > 2:
                color = YEL
            else:
                color = DIM_GRN
            parts.append(f"{color}💰 ${cost_val:.2f}{RST}")
        except (TypeError, ValueError):
            pass

    # 8. Model name
    if model_name:
        parts.append(f"{DIM}{model_name}{RST}")

    line2 = "   ".join(parts)

    if line1 and line2:
        sys.stdout.write(f"{line1}\n{line2}")
    elif line1:
        sys.stdout.write(line1)
    elif line2:
        sys.stdout.write(line2)


if __name__ == "__main__":
    main()

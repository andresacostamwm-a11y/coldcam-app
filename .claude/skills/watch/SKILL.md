---
name: "watch"
description: "Operate the Gmail → WhatsApp email monitor (email_monitor.py): check status, start/stop the watcher, run a single check, tail the log, and manage watched senders. Use when the user says /watch, 'watch emails', 'start the monitor', 'is the monitor running', or asks about email → WhatsApp notifications."
---

# /watch — Email Monitor Control

Control the project's email watcher (`email_monitor.py`). The watcher polls the
Gmail inbox every 3 hours, matches messages from the configured senders, and
forwards a preview to WhatsApp via CallMeBot.

## Usage

```
/watch              # Status: is the monitor running? last check, seen count
/watch start        # Start the monitor in the background
/watch stop         # Stop the running monitor
/watch once         # Run a single check now (no loop), then exit
/watch log          # Show the last 40 lines of the monitor log
/watch senders      # List the currently watched senders
/watch add <name>   # Add a sender keyword to the watch list
/watch remove <name># Remove a sender keyword from the watch list
```

## Prerequisites

Dependencies must be installed first (`schedule`, `requests`, `python-dotenv`
all come from the project requirements):

```bash
python3 -c "import schedule, requests, dotenv" 2>/dev/null || pip install -r requirements.txt
```

The monitor reads credentials from `.env` (see `.env.example`):

- `GMAIL_USER`, `GMAIL_APP_PASSWORD` — IMAP access to the inbox
- `CALLMEBOT_PHONE`, `CALLMEBOT_APIKEY` — WhatsApp delivery

Before starting, verify they are present:

```bash
python3 - <<'EOF'
import os
from dotenv import load_dotenv
load_dotenv()
missing = [k for k in ("GMAIL_USER", "GMAIL_APP_PASSWORD", "CALLMEBOT_PHONE", "CALLMEBOT_APIKEY") if not os.getenv(k)]
print("OK: all credentials set" if not missing else f"MISSING: {', '.join(missing)} — copy .env.example to .env and fill them in")
EOF
```

If anything is missing, stop and tell the user which variables to fill in.
Never print the values themselves.

## Commands

### Step 1: `/watch` — Status (default)

```bash
# Is the monitor running?
pgrep -af "email_monitor.py" || echo "NOT RUNNING"

# How many emails have been processed?
python3 -c "import json,os; f='seen_emails.json'; print(f'Seen emails: {len(json.load(open(f)))}' if os.path.exists(f) else 'Seen emails: 0 (no seen_emails.json yet)')"

# Last activity, if a log exists
tail -5 email_monitor.log 2>/dev/null || echo "No log file yet"
```

Report: running/stopped (with PID), seen-email count, and the last log lines.

### Step 2: `/watch start`

Refuse to start a second instance — check `pgrep` first (Step 1). Then:

```bash
nohup python3 email_monitor.py >> email_monitor.log 2>&1 &
echo "Started with PID $!"
sleep 3 && tail -5 email_monitor.log
```

Confirm from the log that it logged in and completed its first check without
`[ERROR]` lines. An IMAP login failure means bad `GMAIL_APP_PASSWORD`.

### Step 3: `/watch stop`

```bash
pkill -f "email_monitor.py" && echo "Monitor stopped" || echo "Nothing to stop"
```

### Step 4: `/watch once`

Run a single check without the 3-hour loop, using the module's own
`check_emails()`:

```bash
python3 -c "from email_monitor import check_emails; check_emails()"
```

### Step 5: `/watch log`

```bash
tail -40 email_monitor.log 2>/dev/null || echo "No log file yet — start the monitor with /watch start"
```

### Step 6: `/watch senders` / `add` / `remove`

The watch list is the `SENDERS` list at the top of `email_monitor.py`.

- `senders`: read the file and show the list.
- `add <name>`: append the lowercase keyword to `SENDERS` (matching is
  case-insensitive substring against the From header).
- `remove <name>`: delete the matching entry.

After editing, if the monitor is running, restart it (`/watch stop` then
`/watch start`) so the new list takes effect, and say so in the summary.

## Notes

- `seen_emails.json` is the dedupe store. Deleting it makes the monitor
  re-notify recent emails (only within its 3-hour IMAP search window).
- The monitor waits 2 s between WhatsApp sends to respect CallMeBot limits.
- Runs in the foreground when invoked directly (`python3 email_monitor.py`);
  always use `nohup … &` so it survives the shell.

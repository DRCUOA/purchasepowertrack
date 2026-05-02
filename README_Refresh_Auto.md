# Automatic daily refresh (macOS)

This document describes how **NZ Basket Tracker** price refresh is scheduled to run **every day at 12:30 am** in your **Mac’s local timezone**, using a **LaunchAgent** and a small launcher script. It matches the setup for user **Rich** on **MacBook Air**; adjust paths if your machine differs.

Refresh is the same job as **Operations → Run refresh** / `npm run refresh`: it fetches prices, runs review, and updates normalised data.

---

## What gets installed where

| Piece | Path |
|--------|------|
| Launcher script | `~/.mcu/lib/scripts/nzb_refresh_launcher.sh` |
| LaunchAgent definition | `~/Library/LaunchAgents/nz.basket.refresh.plist` |
| Stdout log | `~/.mcu/lib/logs/nzb_refresh.log` |
| Stderr log | `~/.mcu/lib/logs/nzb_refresh.err.log` |
| Application repo | `/Volumes/SecureData/c26/active/purchasepowertrack` (example) |

Expand `~` to your home directory (e.g. `/Users/Rich`).

---

## One-time setup (exact steps)

### 1. Directories

```bash
mkdir -p ~/.mcu/lib/logs
mkdir -p ~/.mcu/lib/scripts
```

### 2. Launcher script

Create `~/.mcu/lib/scripts/nzb_refresh_launcher.sh`:

```bash
#!/bin/bash
set -euo pipefail

REPO="/Volumes/SecureData/c26/active/purchasepowertrack"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Match your default Node major (see “Maintaining when dev env changes”)
nvm use 24 >/dev/null

cd "$REPO"
npm run refresh
```

Make it executable:

```bash
chmod +x ~/.mcu/lib/scripts/nzb_refresh_launcher.sh
```

### 3. Environment file

The server loads **`REPO/.env`** (repo root). Ensure at least:

- `DATABASE_URL`
- `OPENAI_API_KEY`

(Same file you use for local dev.)

### 4. Smoke test (manual)

With the SecureData volume mounted:

```bash
~/.mcu/lib/scripts/nzb_refresh_launcher.sh
```

If this succeeds, scheduling will use the same command chain.

### 5. LaunchAgent plist

Create `~/Library/LaunchAgents/nz.basket.refresh.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>nz.basket.refresh</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/Rich/.mcu/lib/scripts/nzb_refresh_launcher.sh</string>
  </array>

  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>0</integer>
    <key>Minute</key>
    <integer>30</integer>
  </dict>

  <key>StandardOutPath</key>
  <string>/Users/Rich/.mcu/lib/logs/nzb_refresh.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/Rich/.mcu/lib/logs/nzb_refresh.err.log</string>
</dict>
</plist>
```

Replace **`/Users/Rich`** if your account home folder name is different (`echo $HOME`).

### 6. Validate and load

```bash
plutil -lint ~/Library/LaunchAgents/nz.basket.refresh.plist

launchctl bootout gui/$(id -u)/nz.basket.refresh 2>/dev/null || true
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/nz.basket.refresh.plist
launchctl enable gui/$(id -u)/nz.basket.refresh
```

Confirm registration:

```bash
launchctl list | grep basket
```

### 7. Optional: run job once immediately

```bash
launchctl kickstart -k gui/$(id -u)/nz.basket.refresh
```

---

## Maintaining when the app or dev environment changes

`launchd` does **not** load your shell profile (`~/.zshrc`). Only what the launcher script does matters.

| Change | What to update |
|--------|----------------|
| **Repo moved or cloned elsewhere** | Edit `REPO=` in `nzb_refresh_launcher.sh`. |
| **Node major version** (e.g. 24 → 26) | Change `nvm use 24` to the new major, or use `nvm use default` after setting default via `nvm alias default …`. |
| **NVM installed somewhere else** | Set `NVM_DIR` in the script to the real directory. |
| **Switch from NVM to Homebrew Node** | Replace the NVM block with `export PATH="/opt/homebrew/bin:$PATH"` (Apple Silicon) or `/usr/local/bin` (Intel), then call `npm` by full path if needed (`which npm` in Terminal). |
| **`.env` variable names or required keys** | Update repo root `.env`; no plist change unless you add a wrapper that exports extras. |
| **Time of run** | Edit `Hour` / `Minute` in the plist; then **boot out + bootstrap** (see below). |
| **New Mac / new username** | Update **all** `/Users/Rich/...` paths in the plist and verify `REPO`. Re-run bootstrap. |

After **any** edit to the **plist** or **script**:

```bash
launchctl bootout gui/$(id -u)/nz.basket.refresh 2>/dev/null || true
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/nz.basket.refresh.plist
launchctl enable gui/$(id -u)/nz.basket.refresh
```

If `bootstrap` fails on an older macOS, try:

```bash
launchctl unload ~/Library/LaunchAgents/nz.basket.refresh.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/nz.basket.refresh.plist
```

---

## Logs: where they are and how to read them

| File | Contents |
|------|----------|
| `~/.mcu/lib/logs/nzb_refresh.log` | Normal **stdout** from `npm run refresh` (progress lines from the job). |
| `~/.mcu/lib/logs/nzb_refresh.err.log` | **stderr** (Node/npm errors, stack traces, “command not found”). |

Useful commands:

```bash
# Last 80 lines of success-ish output
tail -n 80 ~/.mcu/lib/logs/nzb_refresh.log

# Last 80 lines of errors
tail -n 80 ~/.mcu/lib/logs/nzb_refresh.err.log

# Watch live next run (Ctrl+C to stop)
tail -f ~/.mcu/lib/logs/nzb_refresh.log ~/.mcu/lib/logs/nzb_refresh.err.log
```

Log files **append** across runs; they are **not** rotated automatically. To truncate after a bad run:

```bash
: > ~/.mcu/lib/logs/nzb_refresh.log
: > ~/.mcu/lib/logs/nzb_refresh.err.log
```

---

## Behaviour notes

- **Timezone:** `StartCalendarInterval` uses the Mac’s **local** timezone (System Settings → General → Date & Time).
- **Sleep:** If the Mac is asleep at 12:30 am, the run may happen **after wake** or be skipped depending on power state. Use **Plugged in / prevent sleep** for strict timing, or run the scheduler on an always-on host.
- **External volume:** If `REPO` is under `/Volumes/SecureData/...`, the volume must be **mounted** when the job fires; otherwise `cd` fails and errors appear in **`nzb_refresh.err.log`**.

---

## Common errors and fixes

| Symptom or log message | Likely cause | Fix |
|------------------------|--------------|-----|
| `npm: command not found` | `launchd` has no `PATH`; NVM not loaded | Ensure `NVM_DIR` and `[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"` are in the launcher; or call `/full/path/to/npm` from `which npm`. |
| `nvm: command not found` | Wrong or missing `NVM_DIR` | Set `NVM_DIR="$HOME/.nvm"` (or your install path). |
| `N/A: version "v24" is not yet installed` (or similar) | `nvm use 24` doesn’t match installed versions | Run `nvm list`; change script to `nvm use 24.12.0` or install that major. |
| `Missing required env var: DATABASE_URL` (or `OPENAI_API_KEY`) | `.env` missing or not at repo root | Ensure `/Volumes/SecureData/c26/active/purchasepowertrack/.env` exists with keys; `config` resolves `.env` from repo root relative to `server` config. |
| `cd: REPO: No such file or directory` | Volume unmounted or path wrong | Mount SecureData; update `REPO` in script. |
| `connect ECONNREFUSED` / Postgres errors | DB not running or wrong `DATABASE_URL` | Start Postgres (e.g. Docker); fix URL in `.env`. |
| Job never appears to run; empty logs | Plist not loaded; wrong `Label`; wrong `gui/$UID` | Re-run `bootstrap` / `load`; check `launchctl list \| grep basket`. |
| Plist edit ignored | `launchd` not reloaded | `bootout` then `bootstrap` again (see above). |
| Permission denied on script | Not executable | `chmod +x ~/.mcu/lib/scripts/nzb_refresh_launcher.sh` |

---

## Uninstall

```bash
launchctl bootout gui/$(id -u)/nz.basket.refresh 2>/dev/null || true
rm -f ~/Library/LaunchAgents/nz.basket.refresh.plist
```

 Optionally remove the launcher script and logs under `~/.mcu/lib/` if you no longer need them.

---

## Related project commands

From the repo root:

```bash
npm run refresh    # same work as the scheduled job
npm run snapshot   # monthly snapshot (not scheduled here)
```

In the web app, open **Operations** and use **Preview auto-refresh setup guide** to read this file in the browser (dev: in sync with the repo file; production: content is included at client build time).

---

*Generated for local automation; not required for CI or production servers. For hosted deploys (e.g. Railway), use the platform’s cron / scheduled job instead.*

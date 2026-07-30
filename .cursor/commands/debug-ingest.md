# Debug ingest (Wi‑Fi / Cursor Debug)

Set up live NDJSON ingest from the Obsidian plugin (desktop or mobile) into Cursor’s Debug log file so the agent can watch runtime evidence.

Any text after `/debug-ingest` is optional context (e.g. iPad, session id).

## Preconditions

- User should be in (or about to start) a **Cursor Debug** agent session — shell scripts **cannot** start the ingest listener.
- Note from Debug session context: **session ID** (slug), **ingest path** (`/ingest/<uuid>`), **ingest port**, **log file** (`.cursor/debug-<sessionId>.log`). Path UUID ≠ session slug.

## Steps

1. **Confirm Debug ingest is live**
   - If this is not a Debug-mode session, tell the user to start one (or switch) before continuing.
   - Record session id, ingest path, ingest port, and log file path from the system/debug context.

2. **Write the discovery offer** (required for Connect / auto-connect):
   ```bash
   bash scripts/write-debug-ingest-offer.sh \
     --session <sessionId> --path <ingestPath> --port <ingestPort>
   ```
   Uses `INGEST_RELAY_PORT` when `--port` is omitted (default `7662`).

3. **Start LAN relay + offer sidecar**:
   ```bash
   bash scripts/ingest-lan-relay.sh
   ```
   Run in the background if needed. Requires `socat` and `python3`. Offer listens on **7663**; ingest traffic on the session port.
   Optional host check: `bash scripts/print-debug-ingest-settings.sh`

4. **Configure the plugin** (Settings → Dropbox Sync → Troubleshooting):
   - Enable **Debug logging**
   - **Same Mac:** should show **Connected to …** without tapping Connect
   - **Mobile / other device:** tap **Connect**
   - Tap **Send test log**
   - Prefer Connect over pasting Advanced fields

5. **Clear only the session Cursor Debug log** when preparing a **new** reproduction you are about to ask for (not when analyzing a sync the user already ran):
   - Truncate/delete **only** `.cursor/debug-<sessionId>.log` for this session.
   - Do **not** delete vault `sync-debug-*.log`, `sync-logs/`, or other sessions’ logs. See `.cursor/rules/preserve-sync-debug-logs.mdc`.

6. **Deploy if instrumented / uncommitted**
   - Local `dist/` copy includes working-tree code; CI/release builds do not.
   - Desktop test vault: `bun run build && cp dist/* ~/Documents/sync-tester/.obsidian/plugins/dropbox-sync/`
   - iPad: copy built plugin into the vault’s `.obsidian/plugins/dropbox-sync/` (manual).

7. **Reproduce**, then **read** `.cursor/debug-<sessionId>.log` and cite line evidence before fixing.

8. After a verified fix, remove temporary ad-hoc ingest call sites. Keep `src/debug/cursor-debug-ingest.ts`, `src/debug/cursor-debug-discover.ts`, and the gated `main.log()` path.

## Do not

- Use `fetch('http://127.0.0.1:…')` inside the plugin — use `requestUrl` via `postCursorDebugIngest` / `main.log()`.
- Assume USB alone bridges iOS to localhost (use Wi‑Fi + relay).
- Treat silent ingest failure as proof a code path did not run — verify with **Send test log** and the session log file.
- Skip writing the offer file — without it, Connect / auto-connect cannot discover session/path.

See `docs/cursor-debug-ingest.md` and `.cursor/rules/cursor-debug-ingest.mdc`.

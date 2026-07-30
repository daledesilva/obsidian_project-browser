#!/usr/bin/env bash
# Expose Cursor's localhost-only debug ingest on the LAN (socat) and serve the
# discovery offer on :7663 so the plugin can Connect / auto-connect.
#
# Cursor binds ingest to 127.0.0.1 only. Run this on the Mac while a Cursor
# Debug session is active. Prefer writing the offer first via /debug-ingest:
#   bash scripts/write-debug-ingest-offer.sh --session <id> --path /ingest/<uuid> --port <port>
#   bash scripts/ingest-lan-relay.sh
#
# Requires: socat (`brew install socat`), python3 (offer sidecar).
# Allow inbound TCP on the ingest port and 7663 in macOS Firewall if prompted.
#
# See docs/cursor-debug-ingest.md

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

LISTEN_PORT="${INGEST_RELAY_PORT:-7662}"
TARGET_HOST="${INGEST_RELAY_TARGET_HOST:-127.0.0.1}"
TARGET_PORT="${INGEST_RELAY_TARGET_PORT:-7662}"
OFFER_PORT="${DEBUG_INGEST_OFFER_PORT:-7663}"
OFFER_PATH="${DEBUG_INGEST_OFFER_PATH:-.cursor/debug-ingest-offer.json}"
SIDECAR="${ROOT}/scripts/debug-ingest-offer-sidecar.py"

if ! command -v socat >/dev/null 2>&1; then
	echo "ERROR: socat not found. Install with: brew install socat" >&2
	exit 1
fi
if ! command -v python3 >/dev/null 2>&1; then
	echo "ERROR: python3 not found (needed for offer sidecar on :${OFFER_PORT})." >&2
	exit 1
fi

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
echo "Relaying 0.0.0.0:${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}" >&2
echo "Offer sidecar: http://0.0.0.0:${OFFER_PORT}/offer (file: ${OFFER_PATH})" >&2
if [[ -n "${LAN_IP}" ]]; then
	echo "LAN IP: ${LAN_IP}" >&2
	echo "Desktop: enable Debug logging → auto-connect via 127.0.0.1" >&2
	echo "Mobile: same Wi‑Fi → Settings → Connect (or auto if already cached)" >&2
else
	echo "WARN: could not detect LAN IP (en0/en1). Check System Settings → Network." >&2
fi
if [[ ! -f "${OFFER_PATH}" ]]; then
	echo "WARN: ${OFFER_PATH} missing — write it with write-debug-ingest-offer.sh" >&2
fi
echo "Press Ctrl+C to stop both relay and offer sidecar." >&2

SIDECAR_PID=""
cleanup() {
	if [[ -n "${SIDECAR_PID}" ]] && kill -0 "${SIDECAR_PID}" 2>/dev/null; then
		kill "${SIDECAR_PID}" 2>/dev/null || true
		wait "${SIDECAR_PID}" 2>/dev/null || true
	fi
}
trap cleanup EXIT INT TERM

DEBUG_INGEST_OFFER_PATH="${OFFER_PATH}" DEBUG_INGEST_OFFER_PORT="${OFFER_PORT}" \
	python3 "${SIDECAR}" &
SIDECAR_PID=$!

# Foreground socat so Ctrl+C hits the relay; trap stops the sidecar.
socat "TCP-LISTEN:${LISTEN_PORT},fork,reuseaddr,bind=0.0.0.0" "TCP:${TARGET_HOST}:${TARGET_PORT}"

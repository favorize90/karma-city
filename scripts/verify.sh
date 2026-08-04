#!/usr/bin/env bash
#
# verify.sh — the single success condition for the overnight loop.
#
# Runs the quality gates in dependency order and stops at the first failure
# (a build can't be trusted if types are broken, a smoke test can't run
# without a build). Every stage writes a full log; the summary that the
# tester agent reads lands in .claude/overnight/last-verify.md
#
# Usage:
#   scripts/verify.sh              # all stages
#   scripts/verify.sh --skip-smoke # gates only, no server boot
#   scripts/verify.sh --only build # run a single stage
#
# Exit codes: 0 = all green, 1 = a stage failed, 2 = harness/setup problem.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 2

OUT_DIR=".claude/overnight"
LOG_DIR="$OUT_DIR/logs"
SUMMARY="$OUT_DIR/last-verify.md"
mkdir -p "$LOG_DIR"

SKIP_SMOKE=0
ONLY=""
while [ $# -gt 0 ]; do
  case "$1" in
    --skip-smoke) SKIP_SMOKE=1 ;;
    --only) ONLY="${2:-}"; shift ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "verify.sh: unknown argument '$1'" >&2; exit 2 ;;
  esac
  shift
done

if [ ! -d node_modules ]; then
  echo "verify.sh: node_modules missing — run 'npm ci' first." >&2
  exit 2
fi

# The Next.js build imports modules that throw without Supabase credentials.
# Real values from .env.local always win; these placeholders only keep the
# build from dying on a machine that has never been configured.
if [ ! -f .env.local ]; then
  export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://placeholder.supabase.co}"
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-placeholder-anon-key}"
  ENV_NOTE="no .env.local — ran with placeholder Supabase credentials"
else
  ENV_NOTE=".env.local present"
fi

STARTED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
RESULTS=()
FAILED_STAGE=""

# Per-stage wall-clock ceilings. An unattended loop must fail loudly rather
# than hang: a stuck stage costs the rest of the night.
stage_timeout() {
  case "$1" in
    typecheck) echo 300 ;;
    lint)      echo 300 ;;
    build)     echo 900 ;;
    smoke)     echo 360 ;;
    *)         echo 600 ;;
  esac
}

run_stage() {
  local name="$1"; shift
  if [ -n "$ONLY" ] && [ "$ONLY" != "$name" ]; then
    RESULTS+=("skip|$name|not selected by --only")
    return 0
  fi
  if [ -n "$FAILED_STAGE" ]; then
    RESULTS+=("skip|$name|skipped after $FAILED_STAGE failed")
    return 0
  fi

  local log="$LOG_DIR/$name.log"
  local limit; limit=$(stage_timeout "$name")
  echo "── $name ─────────────────────────────────────────────"
  local start; start=$(date +%s)

  if command -v timeout >/dev/null 2>&1; then
    timeout --kill-after=15s "${limit}s" "$@" >"$log" 2>&1
  else
    "$@" >"$log" 2>&1
  fi
  local code=$?
  local dur=$(( $(date +%s) - start ))

  if [ "$code" -eq 0 ]; then
    echo "   PASS (${dur}s)"
    RESULTS+=("pass|$name|${dur}s")
  elif [ "$code" -eq 124 ] || [ "$code" -eq 137 ]; then
    echo "   FAIL (timed out after ${limit}s) → $log"
    RESULTS+=("fail|$name|timed out after ${limit}s — see $log")
    FAILED_STAGE="$name"
  else
    echo "   FAIL (exit $code, ${dur}s) → $log"
    tail -n 25 "$log" | sed 's/^/   | /'
    RESULTS+=("fail|$name|exit $code after ${dur}s — see $log")
    FAILED_STAGE="$name"
  fi
}

run_stage typecheck npx --no-install tsc --noEmit
run_stage lint      npm run --silent lint
run_stage build     npm run --silent build
if [ "$SKIP_SMOKE" -eq 0 ]; then
  run_stage smoke   node scripts/smoke.mjs
else
  RESULTS+=("skip|smoke|--skip-smoke")
fi

# ── Summary the agents read ────────────────────────────────────────────────
{
  echo "# Verify report"
  echo
  echo "- run started: $STARTED_AT"
  echo "- environment: $ENV_NOTE"
  echo "- commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
  echo
  echo "| stage | result | detail |"
  echo "| --- | --- | --- |"
  for r in "${RESULTS[@]}"; do
    IFS='|' read -r status name detail <<<"$r"
    echo "| $name | $status | $detail |"
  done
  echo
  if [ -n "$FAILED_STAGE" ]; then
    echo "## VERDICT: RED — \`$FAILED_STAGE\` failed"
    echo
    echo "Last 60 lines of \`$LOG_DIR/$FAILED_STAGE.log\`:"
    echo
    echo '```'
    tail -n 60 "$LOG_DIR/$FAILED_STAGE.log"
    echo '```'
  else
    echo "## VERDICT: GREEN — every gate passed"
  fi
} >"$SUMMARY"

echo
if [ -n "$FAILED_STAGE" ]; then
  echo "VERDICT: RED ($FAILED_STAGE) — summary in $SUMMARY"
  exit 1
fi
echo "VERDICT: GREEN — summary in $SUMMARY"
exit 0

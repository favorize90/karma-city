#!/usr/bin/env bash
# Apply every migration to a fresh, throwaway Postgres database and run the
# SQL test suites in supabase/tests/ against it.
#
#   TEST_DATABASE_URL=postgres://postgres@localhost:5432/postgres scripts/test-db.sh
#
# TEST_DATABASE_URL must point at a server where the user may CREATE DATABASE
# and CREATE ROLE — a local or Docker Postgres, never a Supabase project:
#
#   docker run --rm -d -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres:16
#
# Each run creates its own database and drops it afterwards. The shim creates
# the anon/authenticated/service_role roles once per server; reruns reuse them.

set -uo pipefail

if [ -z "${TEST_DATABASE_URL:-}" ]; then
  echo "TEST_DATABASE_URL is not set — see the header of $0" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB="karma_test_$$"
ADMIN_URL="$TEST_DATABASE_URL"
# Swap the database name, keeping any ?query (e.g. ?host=/socket/dir).
URL_BASE="${TEST_DATABASE_URL%%\?*}"
URL_QUERY="${TEST_DATABASE_URL#"$URL_BASE"}"
TEST_URL="${URL_BASE%/*}/$DB$URL_QUERY"

psql_admin() { psql "$ADMIN_URL" -X -q -v ON_ERROR_STOP=1 "$@"; }
psql_test()  { psql "$TEST_URL"  -X -q -v ON_ERROR_STOP=1 "$@"; }

cleanup() { psql_admin -c "drop database if exists $DB" >/dev/null 2>&1; }
trap cleanup EXIT

psql_admin -c "create database $DB" >/dev/null || exit 1

# Roles are server-wide: only create them if an earlier run hasn't.
if psql_admin -Atc "select 1 from pg_roles where rolname = 'authenticated'" | grep -q 1; then
  sed '/^create role /d' "$ROOT/supabase/tests/supabase_shim.sql" | psql_test >/dev/null || exit 1
else
  psql_test -f "$ROOT/supabase/tests/supabase_shim.sql" >/dev/null || exit 1
fi

for f in "$ROOT"/supabase/migrations/*.sql; do
  if ! psql_test -f "$f" >/dev/null 2>"/tmp/test-db-$$.err"; then
    echo "migration failed: $(basename "$f")" >&2
    cat "/tmp/test-db-$$.err" >&2
    rm -f "/tmp/test-db-$$.err"
    exit 1
  fi
done
rm -f "/tmp/test-db-$$.err"
echo "applied $(ls "$ROOT"/supabase/migrations/*.sql | wc -l) migrations to $DB"

status=0
for t in "$ROOT"/supabase/tests/*.sql; do
  [ "$(basename "$t")" = "supabase_shim.sql" ] && continue
  echo
  echo "=== $(basename "$t")"
  # NOTICE lines carry the per-test results.
  psql_test -f "$t" 2>&1 | sed -E 's/^psql:[^ ]+ NOTICE:  //; s/^NOTICE:  //' || status=1
done

exit $status

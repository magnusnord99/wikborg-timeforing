#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT"

supabase db query --linked "select id, type, title, description, to_char(created_at, 'YYYY-MM-DD') as created_at, resolved from feedback order by resolved asc, created_at asc;"

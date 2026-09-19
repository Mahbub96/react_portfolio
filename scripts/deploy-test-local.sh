#!/usr/bin/env bash
set -euo pipefail
exec bash "$(dirname "$0")/deploy-local.sh" test.mahbub.dev "$@"

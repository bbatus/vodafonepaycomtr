#!/usr/bin/env bash
# Runs a SonarQube scan against the local SonarQube instance and prints open
# issues.
#
# 15.09.2026: moved here from the monorepo (`vodafonepaycomtr/scripts/`),
# which used to hold a cross-repo version scanning both this repo and
# `../clover` in one run. That monorepo is no longer in active scope (see
# AGENTS.md) — each repo now owns its own single-target copy. The SonarQube
# server itself is still shared local tooling, started from the monorepo:
#   docker compose -f ../vodafonepaycomtr/tools/sonarqube/docker-compose.yml up -d
#
# Usage:
#   scripts/sonar-scan.sh    # scan this repo (only target there is)
#
# Requires SONAR_TOKEN in the environment. Generate one from the SonarQube UI
# (http://localhost:9002 -> My Account -> Security -> Generate Token) or via:
#   curl -s -u admin:<password> -X POST "http://localhost:9002/api/user_tokens/generate" -d "name=cli-scan-token"
#
# Exits non-zero if the scan finds any open issue — every large
# component/code change should run this and be clean before commit/push
# (see AGENTS.md).
set -euo pipefail

SONAR_HOST_URL_LOCAL="http://localhost:9002"
SONAR_HOST_URL_DOCKER="http://sonarqube:9000"
PROJECT_KEY="vodafonepaycomtr"

# Token resolution, in order: an exported SONAR_TOKEN wins, otherwise read
# .sonar-token at the repo root. That file is gitignored and exists so the
# token is generated ONCE and every later scan just works.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SONAR_TOKEN_FILE="${SONAR_TOKEN_FILE:-${REPO_ROOT}/.sonar-token}"
if [ -z "${SONAR_TOKEN:-}" ] && [ -f "$SONAR_TOKEN_FILE" ]; then
  SONAR_TOKEN="$(tr -d ' \t\r\n' < "$SONAR_TOKEN_FILE")"
fi

if [ -z "${SONAR_TOKEN:-}" ]; then
  cat >&2 <<MSG
SONAR_TOKEN yok.

Bir kereye mahsus:
  1. ${SONAR_HOST_URL_LOCAL} adresine giris yapin
  2. Sag ustteki avatar > My Account > Security
  3. "Generate Tokens" altinda bir isim verip Generate'e basin (tur: User Token)
  4. Uretilen degeri su dosyaya yapistirin (tek satir, baska hicbir sey):
       ${SONAR_TOKEN_FILE}

Bu dosya .gitignore'da — repoya girmez. Sonraki her taramada script onu
kendisi okur, bir daha token sormaz.
MSG
  exit 1
fi

SCAN_TMP="/private/tmp/sonar-scan-${PROJECT_KEY}"

rm -rf "${SCAN_TMP:?}"
mkdir -p "${SCAN_TMP}"
rsync -a --exclude node_modules --exclude .next --exclude .git "${REPO_ROOT}/src/" "${SCAN_TMP}/src/"

# Coverage: run vitest fresh so the report always reflects the current tree
# (not a stale coverage/ dir from a previous run), then hand the lcov report
# to Sonar's JS/TS sensor — lcov.info's SF: lines are already `src/...`-
# relative (vitest.config.ts's own coverage root), matching the layout rsync
# just recreated under /usr/src.
echo "-- Running vitest coverage --"
(cd "${REPO_ROOT}" && npx vitest run --coverage >/dev/null 2>&1) || true
if [ -f "${REPO_ROOT}/coverage/lcov.info" ]; then
  mkdir -p "${SCAN_TMP}/coverage"
  cp "${REPO_ROOT}/coverage/lcov.info" "${SCAN_TMP}/coverage/lcov.info"
else
  echo "WARNING: no coverage/lcov.info produced — coverage will show as 0%." >&2
fi

docker run --rm --network sonar-net \
  -v "${SCAN_TMP}:/usr/src" \
  -w /usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.host.url="${SONAR_HOST_URL_DOCKER}" \
  -Dsonar.token="${SONAR_TOKEN}" \
  -Dsonar.projectKey="${PROJECT_KEY}" \
  -Dsonar.sources="src" \
  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
  -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
  -Dsonar.sourceEncoding=UTF-8

# Give the compute engine a moment to process the report before querying issues.
sleep 6

echo "-- Open issues for ${PROJECT_KEY} --"
issues=$(curl -s -u "${SONAR_TOKEN}:" "${SONAR_HOST_URL_LOCAL}/api/issues/search?componentKeys=${PROJECT_KEY}&resolved=false")
rm -rf "${SCAN_TMP}"

echo "$issues" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f\"Open issues: {d['total']}\")
for i in d['issues']:
    print(f\"  [{i['severity']}] {i['rule']} - {i['component']} - {i['message']}\")
sys.exit(1 if d['total'] > 0 else 0)
"

#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   GITHUB_OWNER=<user-or-org> GITHUB_REPO=facebook-bot ./scripts/publish-facebook-bot.sh

: "${GITHUB_OWNER:?Set GITHUB_OWNER}"
: "${GITHUB_REPO:=facebook-bot}"
: "${GITHUB_VISIBILITY:=public}"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install: https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login" >&2
  exit 1
fi

REMOTE_URL="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git"

echo "Creating repo ${GITHUB_OWNER}/${GITHUB_REPO} (${GITHUB_VISIBILITY})..."
if gh repo view "${GITHUB_OWNER}/${GITHUB_REPO}" >/dev/null 2>&1; then
  echo "Repo already exists, skipping create."
else
  gh repo create "${GITHUB_OWNER}/${GITHUB_REPO}" --"${GITHUB_VISIBILITY}" --source=. --remote=origin --push
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REMOTE_URL"
fi

echo "Pushing current branch..."
git push -u origin HEAD

echo "Adding topic facebook-bot..."
gh repo edit "${GITHUB_OWNER}/${GITHUB_REPO}" --add-topic facebook-bot

echo "Done. Next: add repo secrets FB_STORAGE_STATE_B64 and VERCEL_TOKEN in GitHub settings."

#!/bin/bash
set -e

echo "🔹 Starting delta generation for Merge Request..."

# Ensure sfdx-git-delta plugin is installed
if ! sf plugins | grep -q sfdx-git-delta; then
  echo "Installing sfdx-git-delta plugin..."
  echo y | sf plugins install sfdx-git-delta
fi

# Create output directory
mkdir -p changed-sources

# Show MR context
echo "📌 Target branch: $CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
echo "📌 Source commit: $CI_COMMIT_SHA"

# Fetch target branch to ensure we have the base commit
git fetch origin "$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"

# Define commit range
FROM_COMMIT="origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
TO_COMMIT="$CI_COMMIT_SHA"

echo "🔍 Comparing changes from $FROM_COMMIT to $TO_COMMIT..."

# Debug: show commits info
echo "🔹 Last 5 commits on target branch ($FROM_COMMIT):"
git log -5 --oneline "$FROM_COMMIT"

echo "🔹 Commit being compared (source - $TO_COMMIT):"
git log -1 --oneline "$TO_COMMIT"

# Debug: list files changed between the commits
echo "🔹 Files changed between $FROM_COMMIT and $TO_COMMIT:"
git diff --name-status "$FROM_COMMIT" "$TO_COMMIT"

# Run delta generation (without --verbose)
sf sgd:source:delta \
  --from "$FROM_COMMIT" \
  --to "$TO_COMMIT" \
  --output-dir "changed-sources"

echo "✅ Delta generated in changed-sources/"

# List generated files
ls -lR changed-sources || true

cat changed-sources/package/package.xml

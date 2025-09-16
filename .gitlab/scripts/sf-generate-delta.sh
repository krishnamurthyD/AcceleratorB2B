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

# Run delta generation
sf sgd:source:delta \
  --from "$FROM_COMMIT" \
  --to "$TO_COMMIT" \
  --output "changed-sources"

echo "✅ Delta generated in changed-sources/"
ls -lR changed-sources || true

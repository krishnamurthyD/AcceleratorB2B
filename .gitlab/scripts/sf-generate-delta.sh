#!/bin/bash
set -e

FROM_COMMIT=$1
TO_COMMIT=$2

echo "Generating delta between $FROM_COMMIT and $TO_COMMIT..."

# Ensure sfdx-git-delta plugin is installed for sf
sf plugins | grep sfdx-git-delta || echo y | sf plugins install sfdx-git-delta

# Create output directory if it doesn't exist
mkdir -p changed-sources

# Generate delta using sf CLI
sf sgd:source:delta \
  --from "$FROM_COMMIT" \
  --to "$TO_COMMIT" \#!/bin/bash
set -e

echo "🔹 Starting delta generation for Merge Request..."

# Ensure sfdx-git-delta plugin is installed
sf plugins | grep sfdx-git-delta || echo y | sf plugins install sfdx-git-delta

# Create output directory
mkdir -p changed-sources

# Always compare MR target branch with current commit
echo "📌 Target branch: $CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
echo "📌 Source commit: $CI_COMMIT_SHA"

# Fetch target branch
git fetch origin "$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"

FROM_COMMIT="origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
TO_COMMIT="$CI_COMMIT_SHA"

# Run delta
sf sgd:source:delta \
  --from "$FROM_COMMIT" \
  --to "$TO_COMMIT" \
  --output-dir "changed-sources"

echo "✅ Delta generated in changed-sources/"
ls -lR changed-sources || true

  --output "changed-sources"
ls -lR changed-sources

echo "Delta generated in changed-sources/"

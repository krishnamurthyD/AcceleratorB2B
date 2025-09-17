#!/bin/bash
set -e

TARGET_BRANCH="${CI_MERGE_REQUEST_TARGET_BRANCH_NAME:-$CI_COMMIT_REF_NAME}"
SOURCE_BRANCH="${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME:-$CI_COMMIT_REF_NAME}"

echo "Target branch: $TARGET_BRANCH"
echo "Source branch: $SOURCE_BRANCH"

# Make sure full history is available
git fetch --all --unshallow || true

# Ensure sfdx-git-delta plugin is installed
if ! sf plugins | grep -q sfdx-git-delta; then
  echo y | sf plugins install sfdx-git-delta
fi

# Create output directory
mkdir -p changed-sources

# Fetch latest refs
git fetch origin "$TARGET_BRANCH"
git fetch origin "$SOURCE_BRANCH"

# Define commit range correctly
FROM_COMMIT="origin/$TARGET_BRANCH"
TO_COMMIT="origin/$SOURCE_BRANCH"

echo "🔹 Diffing from $FROM_COMMIT to $TO_COMMIT"
git diff --name-status "$FROM_COMMIT" "$TO_COMMIT"

# Run delta generation
sf sgd:source:delta \
  --from "$FROM_COMMIT" \
  --to "$TO_COMMIT" \
  --output-dir "changed-sources" \
  --source-dir "force-app/" \
  --generate-delta

# Debug output
ls -lR changed-sources || true
cat changed-sources/package/package.xml

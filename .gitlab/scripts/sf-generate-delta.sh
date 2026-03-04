#!/bin/bash
set -e

# Detect MR vs Post-merge
if [ -n "$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME" ] && [ -n "$CI_MERGE_REQUEST_TARGET_BRANCH_NAME" ]; then
  PIPELINE_TYPE="Merge Request"
  TARGET_BRANCH="$CI_MERGE_REQUEST_TARGET_BRANCH_NAME"
  SOURCE_BRANCH="$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME"
else
  PIPELINE_TYPE="Post-Merge"
  TARGET_BRANCH="$CI_COMMIT_REF_NAME"
  SOURCE_BRANCH="$CI_COMMIT_REF_NAME"
fi

echo "🔹 Pipeline type: $PIPELINE_TYPE"
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

if [ "$PIPELINE_TYPE" = "Merge Request" ]; then
  # MR pipeline: compare source vs target branch
  git fetch origin "$TARGET_BRANCH"
  git fetch origin "$SOURCE_BRANCH"

  FROM_COMMIT="origin/$TARGET_BRANCH"
  TO_COMMIT="origin/$SOURCE_BRANCH"
else
  # Post-merge pipeline: compare last commit vs its parent
  FROM_COMMIT=$(git rev-parse HEAD^)
  TO_COMMIT=$(git rev-parse HEAD)
fi

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
echo "🔹 Changed sources generated:"
ls -lR changed-sources || true

if [ -f changed-sources/package/package.xml ]; then
  echo "🔹 Package.xml contents:"
  cat changed-sources/package/package.xml
else
  echo "⚠️ No package.xml generated (no metadata changes detected)."
fi

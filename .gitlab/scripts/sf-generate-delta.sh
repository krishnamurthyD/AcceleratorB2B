#!/bin/bash
set -e
BRANCH="${CI_MERGE_REQUEST_TARGET_BRANCH_NAME:-$CI_COMMIT_REF_NAME}"

# Ensure sfdx-git-delta plugin is installed
if ! sf plugins | grep -q sfdx-git-delta; then
  echo y | sf plugins install sfdx-git-delta
fi

sf --version
sf plugins

# Create output directory
mkdir -p changed-sources

# Fetch target branch
git fetch origin "$BRANCH"

# Define commit range
FROM_COMMIT="origin/$BRANCH"
TO_COMMIT="$CI_COMMIT_SHA"

# Run delta generation
sf sgd:source:delta \
  --from "$FROM_COMMIT" \
  --to "$TO_COMMIT" \
  --output-dir "changed-sources" \
  --source-dir "force-app/" \
  --generate-delta

# List generated files
ls -lR changed-sources || true
cat changed-sources/package/package.xml

# Print contents of each file
for file in $(find changed-sources -type f); do
  cat "$file"
done
#!/bin/bash
set -e

# Inputs: commit range
FROM_COMMIT=$1
TO_COMMIT=$2

echo "Generating delta between $FROM_COMMIT and $TO_COMMIT..."

# Install sfdx-git-delta if not already installed
npm install -g sfdx-git-delta

# Generate the delta
sgd generate delta \
  --from "$FROM_COMMIT" \
  --to "$TO_COMMIT" \
  --output changed-sources/

echo "Delta generated in changed-sources/"

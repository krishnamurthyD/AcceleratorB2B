#!/bin/bash
set -e

# Inputs: commit range
FROM_COMMIT=$1
TO_COMMIT=$2

echo "Generating delta between $FROM_COMMIT and $TO_COMMIT..."

# Check if sfdx-git-delta plugin is installed; install if missing
if ! sf plugins list | grep -q sfdx-git-delta; then
  echo "Installing sfdx-git-delta plugin..."
  echo y | sf plugins install sfdx-git-delta
fi

# Generate the delta using 'sf sgd' instead of 'sgd'
sf sgd generate delta \
  --from "$FROM_COMMIT" \
  --to "$TO_COMMIT" \
  --output changed-sources/

echo "Delta generated in changed-sources/"

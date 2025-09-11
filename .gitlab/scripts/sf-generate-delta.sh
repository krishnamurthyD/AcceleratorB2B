#!/bin/bash
set -e
FROM_COMMIT=$1
TO_COMMIT=$2

echo "Generating delta between $FROM_COMMIT and $TO_COMMIT..."

# Ensure sfdx-git-delta is installed
sfdx plugins --core | grep sfdx-git-delta || sfdx plugins:install sfdx-git-delta

# Generate delta using sfdx instead of sf
sf sgd:source:delta \
  --from "$FROM_COMMIT" \
  --to "$TO_COMMIT" \
  --output "changed-sources"

echo "Delta generated in changed-sources/"

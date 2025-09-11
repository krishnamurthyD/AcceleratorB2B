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
  --to "$TO_COMMIT" \
  --output "changed-sources"

echo "Delta generated in changed-sources/"

#!/bin/bash
echo "Calling Validate"
set -e

# Accept ORG_ALIAS as parameter
ORG_ALIAS=$1

if [ -z "$ORG_ALIAS" ]; then
  echo "ERROR: ORG_ALIAS not provided."
  exit 1
fi

echo "Validating delta deployment to org: $ORG_ALIAS"

# Load TEST_CLASSES and TEST_LEVEL if a build.env exists
if [ -f build.env ]; then
  export $(cat build.env | xargs)
fi

# Default TEST_LEVEL if not set
TEST_LEVEL=${TEST_LEVEL:-RunSpecifiedTests}

# Validate normal source
if [[ -d "changed-sources/force-app" ]]; then
  if [[ -z "$TEST_CLASSES" ]]; then
    echo "Validating without test classes..."
    sf project deploy start \
      --source-dir "changed-sources/force-app" \
      --dry-run \
      --target-org "$ORG_ALIAS" \
      --ignore-conflicts
  else
    echo "Validating with test classes: $TEST_CLASSES"
    sf project deploy start \
      --source-dir "changed-sources/force-app" \
      --dry-run \
      --target-org "$ORG_ALIAS" \
      --test-level "$TEST_LEVEL" \
      -t $TEST_CLASSES \
      --ignore-conflicts
  fi
fi

# Validate destructive changes
if [[ -d "changed-sources/destructiveChanges" ]]; then
  echo "Validating destructive changes..."
  sf project deploy start \
    --metadata-dir "changed-sources/destructiveChanges" \
    --dry-run \
    --purge-on-delete \
    --target-org "$ORG_ALIAS" \
    --ignore-conflicts
fi

echo "Delta validation completed!"

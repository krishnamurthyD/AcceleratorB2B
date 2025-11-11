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
# Detect test classes dynamically inside changed-sources
TEST_CLASSES=""
if [ -d "changed-sources/force-app/main/default/classes" ]; then
  for file in $(grep -rl '@isTest' changed-sources/force-app/main/default/classes --include "*.cls" || true); do
    class_name=$(basename "$file" .cls)
    echo "Found test class: $class_name"
    if [ -n "$TEST_CLASSES" ]; then
      TEST_CLASSES="${TEST_CLASSES} ${class_name}"
    else
      TEST_CLASSES="${class_name}"
    fi
  done
fi

# Check if LWC components exist
HAS_LWC=false
if [ -d "changed-sources/force-app/main/default/lwc" ] && [ -n "$(ls -A changed-sources/force-app/main/default/lwc 2>/dev/null)" ]; then
  echo "LWC components detected"
  HAS_LWC=true
fi

# Default TEST_LEVEL if not set
TEST_LEVEL=${TEST_LEVEL:-RunSpecifiedTests}

# Validate source
if [ -d "changed-sources/force-app" ]; then
  # If no test classes but LWC exists, skip tests
  if [ -z "$TEST_CLASSES" ] && [ "$HAS_LWC" = true ]; then
    echo "No test classes found but LWC components present. Running dry-run without tests."
    sf project deploy start \
      --source-dir "changed-sources/force-app" \
      --dry-run \
      --target-org "$ORG_ALIAS" \
      --test-level NoTestRun \
      --ignore-conflicts
  # If no test classes and no LWC, fail
  elif [ -z "$TEST_CLASSES" ]; then
    echo "Validation won't be done without Test class"
    exit 1
  # If test classes exist, run with tests
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
if [ -d "changed-sources/destructiveChanges" ]; then
  echo "Validating destructive changes..."
  sf project deploy start \
    --metadata-dir "changed-sources/destructiveChanges" \
    --dry-run \
    --purge-on-delete \
    --target-org "$ORG_ALIAS" \
    --ignore-conflicts
fi

echo "Delta validation completed!"

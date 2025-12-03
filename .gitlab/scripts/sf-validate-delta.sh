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
HAS_APEX_CLASSES=false
if [ -d "changed-sources/force-app/main/default/classes" ] && [ -n "$(ls -A changed-sources/force-app/main/default/classes 2>/dev/null)" ]; then
  echo "Apex classes detected"
  HAS_APEX_CLASSES=true
fi

# Default TEST_LEVEL if not set
TEST_LEVEL=${TEST_LEVEL:-RunSpecifiedTests}

# Validate source
if [ -d "changed-sources/force-app" ]; then
  if [ "$HAS_APEX_CLASSES" = true ]; then
    if [ -z "$TEST_CLASSES" ]; then
      echo "Validation won't be done without Test class"
      exit 1
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
  else
    echo "No Apex classes found. Running dry-run without tests."
    sf project deploy start \
      --source-dir "changed-sources/force-app" \
      --dry-run \
      --target-org "$ORG_ALIAS" \
      --test-level NoTestRun \
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

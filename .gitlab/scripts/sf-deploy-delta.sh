#!/bin/bash
echo "Entering deploy delta"
set -e

ORG_ALIAS=${1:?Please provide the target org alias}

echo "Deploying delta to org: $ORG_ALIAS"

# Paths
DELTA_DIR="changed-sources"
FORCE_APP_DIR="$DELTA_DIR/force-app"
DESTRUCTIVE_DIR="$DELTA_DIR/destructiveChanges"

# Deploy normal source
if [ -d "$FORCE_APP_DIR" ]; then
  if [ -z "${TEST_CLASSES:-}" ]; then
    echo "Deploying without test classes..."
    sf project deploy start \
      --source-dir "$FORCE_APP_DIR" \
      --target-org "$ORG_ALIAS" \
      --ignore-conflicts
  else
    echo "Deploying with test classes: $TEST_CLASSES..."
    sf project deploy start \
      --source-dir "$FORCE_APP_DIR" \
      --target-org "$ORG_ALIAS" \
      --test-level "$TEST_LEVEL" \
      --test "$TEST_CLASSES" \
      --ignore-conflicts
  fi
fi

# Deploy destructive changes if any
if [ -d "$DESTRUCTIVE_DIR" ]; then
  echo "Deploying destructive changes..."
  sf project deploy start \
    --metadata-dir "$DESTRUCTIVE_DIR" \
    --purge-on-delete \
    --target-org "$ORG_ALIAS" \
    --ignore-conflicts
fi

echo "Delta deployment completed successfully."

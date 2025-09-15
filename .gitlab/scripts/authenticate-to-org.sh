#!/bin/bash
set -x
set -e

BRANCH="$1"  # Pass CI_COMMIT_REF_NAME
if [ -z "$BRANCH" ]; then
  echo "BRANCH not provided!"
  exit 1
fi

# Determine ORG_ALIAS and auth variable
case "$BRANCH" in
  main)
    ORG_ALIAS="PROD"
    AUTH_VAR="$SF_AUTH_PROD"
    ;;
  develop)
    ORG_ALIAS="INTEGRATION"
    AUTH_VAR="$SF_AUTH_INTEGRATION"
    ;;
  release/*)
    ORG_ALIAS="UAT"
    AUTH_VAR="$SF_AUTH_UAT"
    ;;
  *)
    echo "Unsupported branch: $BRANCH"
    exit 1
    ;;
esac

echo "Selected ORG_ALIAS=$ORG_ALIAS"
echo "ORG_ALIAS=$ORG_ALIAS" >> variables.env

# Write the normal JSON to auth_file.json
AUTH_FILE="./auth_file.json"
echo "$AUTH_VAR" > $AUTH_FILE
echo "Auth file path: $(pwd)/$AUTH_FILE"

# Debug (optional)
pwd
ls -l $AUTH_FILE
cat $AUTH_FILE

# Check if CLI exists
if ! command -v sf >/dev/null 2>&1; then
  echo "Salesforce CLI not found!"
  exit 1
fi

echo "CLI found, proceeding with authentication..."
sf org login sfdx-url --sfdx-url-file $AUTH_FILE --alias $ORG_ALIAS --set-default

echo "Authenticated to org with alias: $ORG_ALIAS"
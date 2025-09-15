#!/bin/bash
set -x  # <-- this prints each command before executing it
set -e  # <-- this stops the script on first failure

ORG_ALIAS="$1"
AUTH_FILE="$2"

echo "Authenticating into Salesforce Org: $ORG_ALIAS"
echo "Auth file path: $(pwd)/$AUTH_FILE"
echo auth_file.json

# Check if CLI is available
if ! command -v sf >/dev/null 2>&1 && ! command -v sfdx >/dev/null 2>&1; then
  echo "Salesforce CLI (sf or sfdx) not found in the container. Exiting..."
  exit 1
fi

echo "CLI found, proceeding with authentication..."

sf org login sfdx-url --sfdx-url-file auth_file.json --alias $ORG_ALIAS

echo "Authenticated to org with alias: $ORG_ALIAS
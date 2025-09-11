#!/bin/bash
# Script to authenticate into a Salesforce org using JWT-based auth

ORG_ALIAS="$1"
AUTH_FILE="$2"

echo "Authenticating into Salesforce Org: $ORG_ALIAS"

# Check if Salesforce CLI (sf/sfdx) is available
if ! command -v sf >/dev/null 2>&1 && ! command -v sfdx >/dev/null 2>&1; then
  echo "Salesforce CLI (sf or sfdx) not found in the container. Exiting..."
  exit 1
fi

# Authenticate using Salesforce CLI
if command -v sf >/dev/null 2>&1; then
  sf org login sfdx-url --sfdx-url-file "$AUTH_FILE" --alias "$ORG_ALIAS" --set-default || exit 1
else
  sfdx auth:sfdxurl:store -f "$AUTH_FILE" -a "$ORG_ALIAS" -s || exit 1
fi

echo "Successfully authenticated into Salesforce Org: $ORG_ALIAS"

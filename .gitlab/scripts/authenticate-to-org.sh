#!/bin/bash
# Authenticate into a Salesforce org using JWT-based auth
# Works in Linux-based GitLab CI containers

set -e  # Exit immediately if any command fails
set -o pipefail

ORG_ALIAS="$1"
AUTH_FILE="$2"

if [ -z "$ORG_ALIAS" ] || [ -z "$AUTH_FILE" ]; then
  echo "Usage: $0 <ORG_ALIAS> <AUTH_FILE>"
  exit 1
fi

echo "Authenticating into Salesforce Org: $ORG_ALIAS"

# Ensure file has Unix line endings (in case it was committed with CRLF)
if file "$0" | grep CRLF >/dev/null; then
  echo "Converting line endings to LF..."
  sed -i 's/\r$//' "$0"
fi

# Check Salesforce CLI availability
if ! command -v sf >/dev/null 2>&1 && ! command -v sfdx >/dev/null 2>&1; then
  echo "Salesforce CLI (sf or sfdx) not found in the container. Exiting..."
  exit 1
fi

# Authenticate using Salesforce CLI
if command -v sf >/dev/null 2>&1; then
  echo "Using sf CLI..."
  sf org login sfdx-url --sfdx-url-file "$AUTH_FILE" --alias "$ORG_ALIAS" --set-default
else
  echo "Using sfdx CLI..."
  sfdx auth:sfdxurl:store -f "$AUTH_FILE" -a "$ORG_ALIAS" -s
fi

echo "Successfully authenticated into Salesforce Org: $ORG_ALIAS"

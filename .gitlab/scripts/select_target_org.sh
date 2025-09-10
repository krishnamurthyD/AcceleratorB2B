#!/bin/sh
TARGET_BRANCH="$1"
echo "Branch detected: $TARGET_BRANCH"

case "$TARGET_BRANCH" in
  main)
    echo "ORG_ALIAS=PROD" > variables.env
    echo "$SF_AUTH_PROD" > auth_file.json
    ;;
  qa)
    echo "ORG_ALIAS=QA" > variables.env
    echo "$SF_AUTH_QA" > auth_file.json
    ;;
  uat)
    echo "ORG_ALIAS=UAT" > variables.env
    echo "$SF_AUTH_UAT" > auth_file.json
    ;;
  *)
    echo "Unsupported branch: $TARGET_BRANCH"
    exit 1
    ;;
esac

echo "Org alias set in variables.env and auth_file.json created"

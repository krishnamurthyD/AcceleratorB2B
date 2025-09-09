#!/bin/sh
TARGET_BRANCH="$1"

echo "Selecting target org..."
echo "Target branch: $TARGET_BRANCH"

case "$TARGET_BRANCH" in
  main)
    echo "ORG_ALIAS=PROD" >> org_output.env
    echo "$SF_AUTH_PROD" > ./auth_file.json
    ;;
  qa)
    echo "ORG_ALIAS=QA" >> org_output.env
    echo "$SF_AUTH_QA" > ./auth_file.json
    ;;
  uat)
    echo "ORG_ALIAS=UAT" >> org_output.env
    echo "$SF_AUTH_UAT" > ./auth_file.json
    ;;
  *)
    echo "Unsupported branch: $TARGET_BRANCH"
    exit 1
    ;;
esac

echo "Org alias set and auth file created"

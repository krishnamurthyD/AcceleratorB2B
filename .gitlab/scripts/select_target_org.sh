#!/bin/sh
TARGET_BRANCH="$1"
echo "Branch detected: $TARGET_BRANCH"

case "$TARGET_BRANCH" in
  main)
    echo "ORG_ALIAS=PROD" > variables.env
    ;;
  qa)
    echo "ORG_ALIAS=QA" > variables.env
    ;;
  uat)
    echo "ORG_ALIAS=UAT" > variables.env
    ;;
  *)
    echo "Unsupported branch: $TARGET_BRANCH"
    exit 1
    ;;
esac

echo "Org alias set in variables.env"

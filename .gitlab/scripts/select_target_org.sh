#!/bin/sh
BRANCH="$CI_COMMIT_REF_NAME"

case "$BRANCH" in
  main)
    echo "ORG_ALIAS=PROD" >> variables.env
    echo "$SF_AUTH_PROD" > auth_file.json
    ;;
  qa)
    echo "ORG_ALIAS=QA" >> variables.env
    echo "$SF_AUTH_QA" > auth_file.json
    ;;
  uat)
    echo "ORG_ALIAS=UAT" >> variables.env
    echo "$SF_AUTH_UAT" > auth_file.json
    ;;
  *)
    echo "Unsupported branch: $BRANCH"
    exit 1
    ;;
esac

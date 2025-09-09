#!/bin/sh
echo "Selecting target org..."
echo "Target branch: $CI_COMMIT_REF_NAME"

case "$CI_COMMIT_REF_NAME" in
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
    echo "Unsupported branch: $CI_COMMIT_REF_NAME"
    exit 1
    ;;
esac

echo "Org alias set and auth file created"

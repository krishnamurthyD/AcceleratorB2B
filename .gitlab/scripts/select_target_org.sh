#!/bin/bash
BRANCH="$CI_COMMIT_REF_NAME"

case "$BRANCH" in
  main)
    echo "ORG_ALIAS=PROD" >> variables.env
    echo "$SF_AUTH_PROD" | grep -v '^{\s*}$' >> ./auth_file.json
    ;;
  develop)
    echo "ORG_ALIAS=INTEGRATION" >> variables.env
    echo "$SF_AUTH_INTEGRATION" | grep -v '^{\s*}$' >> ./auth_file.json
    ;;
  release/*)
    echo "ORG_ALIAS=UAT" >> variables.env
    echo "$SF_AUTH_UAT" | grep -v '^{\s*}$' >> ./auth_file.json
    ;;
  *)
    echo "Unsupported branch: $BRANCH"
    exit 1
    ;;
esac

# Debug: show current directory and auth file content
chmod a+rw ./auth_file.json
ls -l ./auth_file.json
pwd
cat ./auth_file.json
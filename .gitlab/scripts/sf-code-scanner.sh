#!/bin/bash
set -e

echo "🔎 Running Salesforce Code Analyzer..."

# Install scanner plugin if not already available
sf plugins install @salesforce/sfdx-scanner || true

# Run scan and output SARIF
sf scanner run \
  --target "force-app" \
  --format sarif \
  --outfile "code-analysis-results.sarif"

echo "✅ Scan completed, SARIF saved at code-analysis-results.sarif"
cat code-analysis-results.sarif

# Pretty-print violations if jq is available
if command -v jq >/dev/null 2>&1; then
  echo "📋 Violations Report:"

  violation_count=$(jq '[.runs[].results[]] | length' code-analysis-results.sarif)

  if [ "$violation_count" -gt 0 ]; then
    jq -r '
      .runs[] as $run |
      $run.results[] as $res |
      ($run.tool.driver.rules[$res.ruleIndex]) as $rule |
      "Severity: \($rule.properties.severity) | Category: \($rule.properties.category) | Rule: \($res.ruleId)\nMessage: \($res.message.text)\nFile: \($res.locations[0].physicalLocation.artifactLocation.uri)\nLine: \($res.locations[0].physicalLocation.region.startLine)\n---"
    ' code-analysis-results.sarif
  else
    echo "✅ No violations found."
  fi
else
  echo "⚠️ jq not installed, showing raw SARIF instead:"
  cat code-analysis-results.sarif
fi


# Fail pipeline if any severity >= 3 issues are found
# Count high severity issues (>= 3)
high_count=$(jq '
  [
    .runs[] as $run
    | $run.results[] as $res
    | ($run.tool.driver.rules[$res.ruleIndex]) as $rule
    | select(($rule.properties.severity | tonumber) >= 3)
  ] | length
' code-analysis-results.sarif)

# pritter check
echo "🔎 Checking indentation in LWC (JS/HTML/CSS)..."

# Ensure Prettier is installed
if ! command -v prettier >/dev/null 2>&1; then
  echo "⚠️ Prettier not found, installing locally..."
  npm install --no-save prettier
fi

# Run Prettier check and capture output
PRETTIER_OUTPUT=$(npx prettier --check "changed-sources/force-app/main/default/lwc/**/*.{js,html,css}" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ Prettier formatting issues found in LWC files."
  echo "$PRETTIER_OUTPUT"
  echo ""
  echo "👉 Please run 'npx prettier --write changed-sources/force-app/main/default/lwc' locally to fix."
  exit 1
else
  echo "✅ LWC indentation is correct."
fi

if [ "$high_count" -gt 0 ]; then
  echo "❌ Found $high_count high severity violations (severity >= 3). Failing pipeline..."
  exit 1
else
  echo "✅ No high severity violations found."
fi

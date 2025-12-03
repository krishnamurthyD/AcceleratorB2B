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


# Fail pipeline if any severity <= 3 issues are found
high_count=$(jq '
  [
    .runs[] as $run
    | $run.results[] as $res
    | ($run.tool.driver.rules[$res.ruleIndex]) as $rule
    | select(($rule.properties.severity | tonumber) <= 3)
  ] | length
' code-analysis-results.sarif)

echo "🔎 Checking indentation in LWC (JS/HTML/CSS)..."

# Get changed files only
FILES=$(git diff --name-only origin/main | grep -E '\.(js|html|css)$' || true)

FAIL=0

for FILE in $FILES; do
  # ❌ Rule 1: No TAB characters allowed
  if grep -P "\t" "$FILE"; then
    echo "❌ TAB indentation found in $FILE (use spaces only)"
    FAIL=1
  fi

  # ❌ Rule 2: Prevent mixed indentation (tab + spaces at same line)
  if grep -P "^\s*\t+\s+" "$FILE"; then
    echo "❌ Mixed indentation found in $FILE"
    FAIL=1
  fi
done

if [ $FAIL -eq 1 ]; then
  echo ""
  echo "❗ Fix indentation: replace TAB with spaces (2 spaces)"
  exit 1
else
  echo "✅ Indentation OK (spaces only)"
fi




if [ "$high_count" -gt 0 ]; then
  echo "❌ Found $high_count violations with severity <= 3. Failing pipeline..."
  exit 1
else
  echo "✅ No high/medium severity violations found."
fi

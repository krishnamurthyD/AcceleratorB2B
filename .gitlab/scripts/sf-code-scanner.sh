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
  jq -r '
    .runs[] as $run |
    $run.results[] as $res |
    ($run.tool.driver.rules[$res.ruleIndex]) as $rule |
    "Severity: \($rule.properties.severity) | Category: \($rule.properties.category) | Rule: \($res.ruleId)\nMessage: \($res.message.text)\nFile: \($res.locations[0].physicalLocation.artifactLocation.uri)\nLine: \($res.locations[0].physicalLocation.region.startLine)\n---"
  ' code-analysis-results.sarif || true
else
  echo "⚠️ jq not installed, showing raw SARIF instead:"
  cat code-analysis-results.sarif
fi

# Fail pipeline if any severity >= 3 issues are found
if jq -e '
  [.runs[] as $run |
   $run.results[] as $res |
   ($run.tool.driver.rules[$res.ruleIndex]) as $rule |
   select($rule.properties.severity >= 3)
  ] | length > 0
' code-analysis-results.sarif >/dev/null; then
  echo "❌ High severity violations found (severity >= 3). Failing pipeline..."
  exit 1
else
  echo "✅ No high severity violations found."
fi
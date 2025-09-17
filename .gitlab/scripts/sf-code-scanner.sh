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
# cat code-analysis-results.sarif

# Pretty-print violations if jq is available
if command -v jq >/dev/null 2>&1; then
  echo "📋 Violations Report:"
  jq -r '
    .runs[].results[] |
    "Level: \(.level)\nRule: \(.ruleId)\nMessage: \(.message.text)\nFile: \(.locations[0].physicalLocation.artifactLocation.uri)\nLine: \(.locations[0].physicalLocation.region.startLine)\n---"
  ' code-analysis-results.sarif || true
else
  echo "⚠️ jq not installed, showing raw SARIF instead:"
  cat code-analysis-results.sarif
fi

# Fail pipeline if errors or warnings are found
if grep -q '"level": "error"' code-analysis-results.sarif || \
   grep -q '"level": "warning"' code-analysis-results.sarif; then
  echo "❌ Violations found! Failing pipeline..."
  exit 1
else
  echo "✅ No violations found."
fi
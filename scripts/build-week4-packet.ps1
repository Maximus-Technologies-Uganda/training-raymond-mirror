# Build Week 4 Review Packet
# Creates a ZIP file with all Week 4 deliverables for mentor review

$ErrorActionPreference = "Stop"

Write-Host "Building Week 4 Review Packet..." -ForegroundColor Cyan

# Define paths
$rootDir = "c:\Users\RAYMOND\Desktop\Work Projects\training-raymond"
$artifactsDir = Join-Path $rootDir "review-artifacts"
$packetDir = Join-Path $rootDir "week4-review-packet"
$zipPath = Join-Path $rootDir "week4-review-packet.zip"

# Clean up previous packet
if (Test-Path $packetDir) {
    Write-Host "  Removing old packet directory..." -ForegroundColor Yellow
    Remove-Item -Path $packetDir -Recurse -Force
}

if (Test-Path $zipPath) {
    Write-Host "  Removing old ZIP file..." -ForegroundColor Yellow
    Remove-Item -Path $zipPath -Force
}

# Create packet directory
Write-Host "  Creating packet structure..." -ForegroundColor Green
New-Item -ItemType Directory -Path $packetDir -Force | Out-Null

# Copy review document
Write-Host "  Copying review document..." -ForegroundColor Green
Copy-Item -Path (Join-Path $artifactsDir "review-week4.md") -Destination (Join-Path $packetDir "README.md") -Force

# Copy coverage reports
Write-Host "  Copying coverage reports..." -ForegroundColor Green
$coverageDir = Join-Path $packetDir "coverage"
New-Item -ItemType Directory -Path $coverageDir -Force | Out-Null

# CLI coverage
if (Test-Path (Join-Path $rootDir "coverage")) {
    Copy-Item -Path (Join-Path $rootDir "coverage") -Destination (Join-Path $coverageDir "cli") -Recurse -Force
}

# UI coverage
if (Test-Path (Join-Path $artifactsDir "ui\unit")) {
    Copy-Item -Path (Join-Path $artifactsDir "ui\unit") -Destination (Join-Path $coverageDir "ui") -Recurse -Force
}

# Copy Playwright report
Write-Host "  Copying Playwright report..." -ForegroundColor Green
if (Test-Path (Join-Path $rootDir "apps\ui\playwright\report")) {
    Copy-Item -Path (Join-Path $rootDir "apps\ui\playwright\report") -Destination (Join-Path $packetDir "playwright-report") -Recurse -Force
}

# Copy spec files
Write-Host "  Copying spec files..." -ForegroundColor Green
$specsDir = Join-Path $packetDir "specs"
New-Item -ItemType Directory -Path $specsDir -Force | Out-Null

@("slice-a-expenses-csv", "slice-b-todo-filter", "slice-c-quote-search") | ForEach-Object {
    $sliceDir = Join-Path $rootDir "specs\$_"
    if (Test-Path $sliceDir) {
        Copy-Item -Path $sliceDir -Destination (Join-Path $specsDir $_) -Recurse -Force
    }
}

# Copy Week 4 documentation
Write-Host "  Copying documentation..." -ForegroundColor Green
$docsDir = Join-Path $packetDir "docs"
New-Item -ItemType Directory -Path $docsDir -Force | Out-Null

@("week4-README.md", "design-tokens.md", "figma-setup-guide.md") | ForEach-Object {
    $docFile = Join-Path $rootDir "docs\$_"
    if (Test-Path $docFile) {
        Copy-Item -Path $docFile -Destination (Join-Path $docsDir $_) -Force
    }
}

# Create manifest
Write-Host "  Creating manifest..." -ForegroundColor Green
$manifest = @"
# Week 4 Review Packet Manifest

Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Repository: training-raymond
Trainee: Raymond
Week: 4 (Nov 10-14, 2025)

## Contents

- README.md - Week 4 review document
- coverage/
  - cli/ - CLI test coverage HTML report
  - ui/ - UI test coverage HTML report
- playwright-report/ - Playwright E2E test results
- specs/ - Spec Kit documentation for all 3 slices
  - slice-a-expenses-csv/
  - slice-b-todo-filter/
  - slice-c-quote-search/
- docs/ - Design and implementation documentation
  - week4-README.md
  - design-tokens.md
  - figma-setup-guide.md

## Summary

- **Implementation**: 18 tasks (T001-T018) across 3 slices - All Complete ✅
- **CLI Coverage**: 63.24% (exceeds 60% target)
- **UI Coverage**: 88%+ overall (exceeds 80% target)
- **E2E Tests**: 26 tests (21 @smoke + 5 @a11y)
- **Figma**: https://www.figma.com/make/vHyEbwViJEEhxDf9wfqZd1/Week-4-training-Raymond

## How to Review

1. Open README.md for complete review
2. View coverage/cli/index.html in browser
3. View coverage/ui/index.html in browser
4. View playwright-report/index.html for E2E results
5. Check specs/ for task completion status
6. View Figma link for design documentation

## Key Files

- specs/slice-a-expenses-csv/tasks.md - Expenses tasks (T001-T006) ✅
- specs/slice-b-todo-filter/tasks.md - ToDo tasks (T007-T012) ✅
- specs/slice-c-quote-search/tasks.md - Quote tasks (T013-T018) ✅
"@

$manifest | Out-File -FilePath (Join-Path $packetDir "MANIFEST.md") -Encoding UTF8 -Force

# Create ZIP file
Write-Host "  Creating ZIP archive..." -ForegroundColor Green
Compress-Archive -Path $packetDir -DestinationPath $zipPath -Force

# Summary
Write-Host ""
Write-Host "✅ Week 4 Review Packet created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "  ZIP file: $zipPath" -ForegroundColor Cyan
Write-Host "  Size: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. git add week4-review-packet.zip" -ForegroundColor White
Write-Host "  2. git commit -m 'chore: add week 4 review packet'" -ForegroundColor White
Write-Host "  3. git tag v0.4.0-week4" -ForegroundColor White
Write-Host "  4. git push origin feature/week4-day1-specs-automation --tags" -ForegroundColor White
Write-Host "  5. Create GitHub Release with this ZIP file" -ForegroundColor White
Write-Host ""

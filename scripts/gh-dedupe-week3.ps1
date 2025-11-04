param(
  [Parameter(Mandatory = $true)][string]$Org,
  [Parameter(Mandatory = $true)][string]$Repo,   # e.g. Maximus-Technologies-Uganda/training-raymond
  [switch]$DryRun
)

function Assert-GhCli {
  try { gh --version | Out-Null } catch { throw "GitHub CLI 'gh' not found. Install from https://cli.github.com/" }
}

Assert-GhCli

# Ensure 'duplicate' label exists
$labelName = 'duplicate'
$labelsJson = gh label list -R $Repo --json name 2>$null | ConvertFrom-Json
if (-not ($labelsJson | Where-Object { $_.name -eq $labelName })) {
  gh label create $labelName -R $Repo -c '#d73a4a' -d 'Duplicate issue' 2>$null | Out-Null
}

# Load all Week3/SpecKit issues (open + closed) that look like SpecKit tasks with T### prefix
$issues = gh issue list -R $Repo --state all --limit 1000 --json number,title,url,state,createdAt 2>$null | ConvertFrom-Json
if (-not $issues) { Write-Host 'No issues found.'; exit 0 }

$taskIssues = $issues | Where-Object { $_.title -match '^T\d{3}\b' }
if (-not $taskIssues) { Write-Host 'No SpecKit task issues found (T### prefix).'; exit 0 }

# Group by exact title; keep the lowest issue number; close the rest
$groups = $taskIssues | Group-Object -Property title | Where-Object { $_.Count -gt 1 }
if ($groups.Count -eq 0) { Write-Host 'No duplicates found.'; exit 0 }

Write-Host ("Found {0} duplicate title group(s)." -f $groups.Count) -ForegroundColor Cyan

foreach ($g in $groups) {
  $sorted = $g.Group | Sort-Object -Property number
  $keep = $sorted[0]
  $dupes = $sorted | Select-Object -Skip 1
  Write-Host ("Keeping #{0}: {1}" -f $keep.number, $keep.title) -ForegroundColor Green
  foreach ($d in $dupes) {
    Write-Host ("Closing duplicate #{0}" -f $d.number) -ForegroundColor Yellow
    if (-not $DryRun) {
      gh issue comment -R $Repo $d.number -b ("Duplicate of #{0}" -f $keep.number) 2>$null | Out-Null
      gh issue edit -R $Repo $d.number --add-label $labelName 2>$null | Out-Null
      gh issue close -R $Repo $d.number -c ("Duplicate of #{0}" -f $keep.number) 2>$null | Out-Null
      Start-Sleep -Milliseconds 100
    }
  }
}

Write-Host 'Deduplication complete.' -ForegroundColor Green



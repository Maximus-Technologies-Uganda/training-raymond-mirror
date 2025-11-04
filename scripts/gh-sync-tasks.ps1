param(
  [Parameter(Mandatory = $true)][string]$Org,
  [Parameter(Mandatory = $true)][string]$Repo,   # e.g. Maximus-Technologies-Uganda/training-raymond
  [Parameter(Mandatory = $true)][int]$ProjectNumber,
  [string]$TasksPath = "specs/001-update-specify-md/tasks.md",
  [int]$MinId = 1,     # minimum task ID numeric, e.g., 26 to start from T026
  [int]$MaxId = 999,   # maximum task ID numeric, e.g., 38 to stop at T038
  [string]$Labels = "speckit,week3",
  [switch]$DryRun
)

function Assert-GhCli {
  try { gh --version | Out-Null } catch { throw "GitHub CLI 'gh' not found. Install from https://cli.github.com/" }
}

Assert-GhCli

if (-not (Test-Path $TasksPath)) { throw "Tasks file not found: $TasksPath" }

# Ensure labels exist
$labelList = ($Labels -split ',') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
foreach ($label in $labelList) {
  $check = gh label list -R $Repo --json name 2>$null | ConvertFrom-Json | Where-Object { $_.name -eq $label }
  if (-not $check) { gh label create $label -R $Repo -c '#6f42c1' -d 'SpecKit task label' 2>$null | Out-Null }
}

# Parse tasks
$content = Get-Content -Raw -Path $TasksPath -Encoding UTF8
$parsed = @()
foreach ($line in $content -split "`r?`n") {
  if ($line -match '^\s*-\s*\[\s*\]\s*(T(\d{3}))\s+(.*)$') {
    $idNum = [int]$Matches[2]
    if ($idNum -ge $MinId -and $idNum -le $MaxId) {
      $parsed += [pscustomobject]@{ IdNum = $idNum; Title = ($Matches[1] + ' ' + $Matches[3]).Trim() }
    }
  }
}

if ($parsed.Count -eq 0) { throw "No checklist tasks in range T$('{0:D3}' -f $MinId)..T$('{0:D3}' -f $MaxId) found in $TasksPath" }

Write-Host "Found $($parsed.Count) tasks in range T$('{0:D3}' -f $MinId)..T$('{0:D3}' -f $MaxId)." -ForegroundColor Cyan

# Load existing issues (state all) for dedupe by exact title
$existing = gh issue list -R $Repo --state all --limit 500 --json title,url,number 2>$null | ConvertFrom-Json
$existingMap = @{}
if ($existing) { foreach ($i in $existing) { $existingMap[$i.title] = $i.url } }

$created = @()
foreach ($t in ($parsed | Sort-Object IdNum)) {
  if ($existingMap.ContainsKey($t.Title)) {
    Write-Host "Skip (exists): $($t.Title)" -ForegroundColor DarkYellow
    $created += $existingMap[$t.Title]
    continue
  }

  if ($DryRun) {
    Write-Host "[DRY RUN] Would create issue: $($t.Title)" -ForegroundColor Yellow
    continue
  }

  $out = gh issue create -R $Repo -t $t.Title -b "Created from SpecKit tasks.md" -l $Labels 2>&1
  if ($LASTEXITCODE -ne 0) { throw "Failed to create issue: $($t.Title)`n$out" }
  $url = ($out | Select-Object -Last 1).Trim()
  if (-not $url.StartsWith('http')) { throw "Unexpected gh output for: $($t.Title)`n$out" }
  $created += $url
  Write-Host "Created: $($t.Title)" -ForegroundColor Green
  Start-Sleep -Milliseconds 150
}

if (-not $DryRun -and $created.Count -gt 0) {
  Write-Host "Adding $($created.Count) issues to project $ProjectNumber..." -ForegroundColor Cyan
  foreach ($url in $created) {
    $addOut = gh project item-add $ProjectNumber --owner $Org --url $url 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Host "⚠ Failed to add to project: $url" -ForegroundColor Yellow } else { Write-Host "Added: $url" -ForegroundColor DarkGreen }
    Start-Sleep -Milliseconds 120
  }
}

Write-Host "Done. Processed $($parsed.Count) tasks in range." -ForegroundColor Green



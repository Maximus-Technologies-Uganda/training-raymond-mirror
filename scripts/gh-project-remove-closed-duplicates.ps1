param(
  [Parameter(Mandatory = $true)][string]$Org,
  [Parameter(Mandatory = $true)][string]$Repo,   # e.g. Maximus-Technologies-Uganda/training-raymond
  [Parameter(Mandatory = $true)][int]$ProjectNumber,
  [string]$Label = 'duplicate',
  [switch]$DryRun
)

function Assert-GhCli {
  try { gh --version | Out-Null } catch { throw "GitHub CLI 'gh' not found. Install from https://cli.github.com/" }
}

Assert-GhCli

# Parse owner/name from $Repo if provided as owner/name
if ($Repo -match '^(?<owner>[^/]+)/(?<name>.+)$') {
  $owner = $Matches['owner']
  $name = $Matches['name']
} else {
  throw "Repo must be in 'owner/name' format"
}

Write-Host "Cleaning Project #$ProjectNumber for closed issues labeled '$Label' in $Repo..." -ForegroundColor Cyan

# Get project id (not strictly needed for delete, but useful to validate access)
$qProj = 'query($org:String!,$num:Int!){organization(login:$org){projectV2(number:$num){id}}}'
gh api graphql -f query="$qProj" -F org="$Org" -F num="$ProjectNumber" 1>$null
if ($LASTEXITCODE -ne 0) { Write-Host 'Warning: could not validate project access (continuing)...' -ForegroundColor Yellow }

# Get closed issues with the label
$issues = gh issue list -R $Repo --label "$Label" --state closed --limit 1000 --json number,url,title 2>$null | ConvertFrom-Json
if (-not $issues) { Write-Host 'No closed duplicate issues found.'; exit 0 }

Write-Host ("Found {0} closed duplicate issues." -f $issues.Count) -ForegroundColor DarkCyan

$mutDelete = 'mutation($item:ID!){deleteProjectV2Item(input:{itemId:$item}){deletedItemId}}'

$removed = 0
foreach ($i in $issues) {
  # Find project items for this issue
  $qItems = 'query($owner:String!,$repo:String!,$num:Int!){repository(owner:$owner,name:$repo){issue(number:$num){id projectItems(first:50){nodes{id project{number}}}}}}'
  $resp = gh api graphql -f query="$qItems" -F owner="$owner" -F repo="$name" -F num=$($i.number) | ConvertFrom-Json
  $nodes = $resp.data.repository.issue.projectItems.nodes
  if (-not $nodes) { continue }
  foreach ($n in $nodes) {
    if ($n.project.number -eq $ProjectNumber) {
      Write-Host ("Removing project item for issue #{0}" -f $i.number) -ForegroundColor Yellow
      if (-not $DryRun) {
        gh api graphql -f query="$mutDelete" -F item="$($n.id)" 1>$null
      }
      $removed++
    }
  }
}

Write-Host ("Done. Removed {0} project item(s)." -f $removed) -ForegroundColor Green



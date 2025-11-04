param(
    [Parameter(Mandatory = $true)]
    [string]$Org,

    [Parameter(Mandatory = $true)]
    [string]$Repo,

    [Parameter(Mandatory = $true)]
    [int]$ProjectNumber,

    [Parameter(Mandatory = $true)]
    [string]$TasksPath,

    [switch]$DryRun
)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error 'The GitHub CLI (gh) is required but not found in PATH.'
    exit 1
}

if (-not (Test-Path $TasksPath)) {
    Write-Error "Tasks file not found at path: $TasksPath"
    exit 1
}

$rawLines = Get-Content -Path $TasksPath
$taskItems = @()

foreach ($line in $rawLines) {
    if ($line -match '^\s*-\s*\[\s*\]\s*(T\d{3}[^\r\n]*)$') {
        $taskItems += $Matches[1].Trim()
    }
}

if ($taskItems.Count -eq 0) {
    Write-Warning 'No unchecked tasks found to import.'
    exit 0
}

foreach ($task in $taskItems) {
    if ($DryRun) {
        Write-Host "[DRY RUN] Would create issue and project item for: $task"
        continue
    }

    Write-Host "Creating issue for task: $task"
    $issueOutput = gh issue create -R $Repo -t $task -b 'Created from SpecKit tasks.md' -l 'week3,speckit'

    $issueUrl = $issueOutput | Select-Object -Last 1
    if (-not $issueUrl) {
        Write-Warning "Issue creation did not return a URL for task: $task"
        continue
    }

    Write-Host "Adding issue to project $Org/$ProjectNumber"
    gh project item-add --owner $Org --number $ProjectNumber --url $issueUrl.Trim() | Out-Null
    Write-Host "Imported: $issueUrl"
}

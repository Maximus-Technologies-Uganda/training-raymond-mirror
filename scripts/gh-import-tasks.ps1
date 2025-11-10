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
    # Accept any unchecked checklist item. We capture the full text after the checkbox,
    # allowing prefixes like "1. " or "T123 " or none at all.
    if ($line -match '^\s*-\s*\[\s*\]\s*(.+)$') {
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
    $issueOutput = gh issue create -R $Repo -t $task -b 'Created from SpecKit tasks.md' -l 'week4,speckit'

    $issueUrl = $issueOutput | Select-Object -Last 1
    if (-not $issueUrl) {
        Write-Warning "Issue creation did not return a URL for task: $task"
        continue
    }

    Write-Host "Adding issue to project $Org/$ProjectNumber"
    try {
        # Prefer syntax where project number is positional argument
        gh project item-add $ProjectNumber --owner $Org --url $issueUrl.Trim() | Out-Null
    } catch {
        try {
            # Fallback legacy flag syntax
            gh project item-add --owner $Org --number $ProjectNumber --url $issueUrl.Trim() | Out-Null
        } catch {
            Write-Warning ("Failed to add issue to project {0}/{1}: {2}" -f $Org, $ProjectNumber, $issueUrl)
        }
    }
    Write-Host "Imported: $issueUrl"
}

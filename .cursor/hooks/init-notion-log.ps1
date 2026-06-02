param(
  [Parameter(Mandatory = $true)]
  [string]$ParentPageId,
  [string]$Title = "Cursor Activity Log"
)

$ErrorActionPreference = "Stop"
$ConfigPath = Join-Path $PSScriptRoot ".notion-log.json"
$config = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json

$tokenEnv = [string]$config.notionTokenEnv
if ([string]::IsNullOrWhiteSpace($tokenEnv)) {
  $tokenEnv = "NOTION_TOKEN"
}

$token = [Environment]::GetEnvironmentVariable($tokenEnv)
if ([string]::IsNullOrWhiteSpace($token)) {
  throw "Set environment variable '$tokenEnv' to your Notion integration token before running init."
}

if (-not [string]::IsNullOrWhiteSpace([string]$config.targetPageId)) {
  Write-Host "Log page already configured: $($config.targetPageId)"
  exit 0
}

$headers = @{
  Authorization    = "Bearer $token"
  "Notion-Version" = [string]$config.notionVersion
  "Content-Type"   = "application/json"
}

$body = @{
  parent     = @{ page_id = $ParentPageId }
  properties = @{
    title = @(
      @{
        type = "text"
        text = @{ content = $Title }
      }
    )
  }
  children   = @(
    @{
      object    = "block"
      type      = "paragraph"
      paragraph = @{
        rich_text = @(
          @{
            type = "text"
            text = @{ content = "Cursor activity log (auto-generated)." }
          }
        )
      }
    }
  )
} | ConvertTo-Json -Depth 20

$page = Invoke-RestMethod -Method Post -Uri "https://api.notion.com/v1/pages" -Headers $headers -Body $body -TimeoutSec 30
$config.targetPageId = $page.id
$config.parentPageId = $ParentPageId
$config.title = $Title
$config | ConvertTo-Json -Depth 20 | Set-Content -Path $ConfigPath -Encoding UTF8

Write-Host "Created Notion log page: $($page.id)"
Write-Host "URL: $($page.url)"

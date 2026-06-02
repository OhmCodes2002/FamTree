param(
  [string]$InputJson = ""
)

function Get-ProjectRoot {
  return (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

function Get-Config {
  $path = Join-Path $PSScriptRoot ".notion-log.json"
  if (-not (Test-Path $path)) {
    throw "Missing config: $path"
  }
  return (Get-Content -Raw -Path $path | ConvertFrom-Json)
}

function Get-StatePath([object]$Config) {
  $rel = [string]$Config.dedupeStateFile
  if ([string]::IsNullOrWhiteSpace($rel)) {
    $rel = ".cursor/hooks/.notion-log-state.json"
  }
  return (Join-Path (Get-ProjectRoot) ($rel -replace "/", "\"))
}

function Redact-Text([string]$Text, [object]$Config) {
  if ([string]::IsNullOrEmpty($Text) -or -not $Config.enableRedaction) {
    return $Text
  }

  $out = $Text
  foreach ($pattern in @($Config.redactionPatterns)) {
    if ([string]::IsNullOrWhiteSpace([string]$pattern)) { continue }
    $out = [regex]::Replace($out, [string]$pattern, '${1}[REDACTED]')
  }
  return $out
}

function Truncate-Text([string]$Text, [int]$Max) {
  if ($Max -le 0 -or [string]::IsNullOrEmpty($Text)) { return $Text }
  if ($Text.Length -le $Max) { return $Text }
  return ($Text.Substring(0, $Max) + "`n...[truncated]")
}

function Get-HookStdoutResponse([string]$EventName) {
  switch ($EventName) {
    "beforeSubmitPrompt" { return '{"continue":true}' }
    { $_ -in @("beforeShellExecution", "beforeMCPExecution", "beforeReadFile", "preToolUse") } {
      return '{"permission":"allow"}'
    }
    default { return '{}' }
  }
}

function Get-DedupeKey([object]$Payload) {
  $parts = @(
    [string]$Payload.hook_event_name,
    [string]$Payload.conversation_id,
    [string]$Payload.generation_id,
    [string]$Payload.session_id,
    [string]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  )
  return ($parts -join "|")
}

function Test-And-Remember-Dedupe([string]$Key, [object]$Config) {
  $path = Get-StatePath $Config
  $keys = @()

  if (Test-Path $path) {
    try {
      $state = Get-Content -Raw -Path $path | ConvertFrom-Json
      if ($state.keys) { $keys = @($state.keys) }
    } catch {
      $keys = @()
    }
  }

  if ($keys -contains $Key) { return $true }

  $keys = ,$Key + $keys | Select-Object -First 500
  @{ keys = $keys } | ConvertTo-Json -Depth 5 | Set-Content -Path $path -Encoding UTF8
  return $false
}

function Split-NotionChunks([string]$Text) {
  $max = 1800
  if ([string]::IsNullOrEmpty($Text)) { return @("") }

  $chunks = New-Object System.Collections.Generic.List[string]
  for ($i = 0; $i -lt $Text.Length; $i += $max) {
    $len = [Math]::Min($max, $Text.Length - $i)
    $chunks.Add($Text.Substring($i, $len)) | Out-Null
  }
  return $chunks.ToArray()
}

function Invoke-NotionAppend([string]$PageId, [string]$Heading, [string]$Body, [object]$Config) {
  $tokenEnv = [string]$Config.notionTokenEnv
  if ([string]::IsNullOrWhiteSpace($tokenEnv)) { $tokenEnv = "NOTION_TOKEN" }

  $token = [Environment]::GetEnvironmentVariable($tokenEnv)
  if ([string]::IsNullOrWhiteSpace($token)) { return }

  $headers = @{
    Authorization    = "Bearer $token"
    "Notion-Version" = [string]$Config.notionVersion
    "Content-Type"   = "application/json"
  }

  $children = New-Object System.Collections.Generic.List[object]
  $children.Add(@{
    object    = "block"
    type      = "heading_3"
    heading_3 = @{
      rich_text = @(
        @{
          type = "text"
          text = @{ content = (Truncate-Text $Heading 200) }
        }
      )
    }
  }) | Out-Null

  foreach ($chunk in (Split-NotionChunks $Body)) {
    $children.Add(@{
      object    = "block"
      type      = "paragraph"
      paragraph = @{
        rich_text = @(
          @{
            type = "text"
            text = @{ content = $chunk }
          }
        )
      }
    }) | Out-Null
  }

  $payload = @{ children = $children.ToArray() } | ConvertTo-Json -Depth 20
  $uri = "https://api.notion.com/v1/blocks/$PageId/children"
  $attempts = 1 + [int]$Config.retryCount

  for ($i = 0; $i -lt $attempts; $i++) {
    try {
      Invoke-RestMethod -Method Patch -Uri $uri -Headers $headers -Body $payload -TimeoutSec 15 | Out-Null
      return
    } catch {
      if ($i -ge ($attempts - 1)) { throw }
      Start-Sleep -Milliseconds ([int]$Config.retryDelayMs)
    }
  }
}

function Convert-PayloadToLogText([object]$Payload, [object]$Config) {
  $lines = New-Object System.Collections.Generic.List[string]
  $event = [string]$Payload.hook_event_name

  $lines.Add("event: $event") | Out-Null
  $lines.Add("time_utc: $([DateTimeOffset]::UtcNow.ToString('o'))") | Out-Null

  foreach ($name in @("conversation_id", "generation_id", "session_id", "model", "user_email")) {
    if ($Payload.PSObject.Properties.Name -contains $name) {
      $lines.Add("$name`: $([string]$Payload.$name)") | Out-Null
    }
  }

  if ($Payload.workspace_roots) {
    $lines.Add("workspace_roots: $($Payload.workspace_roots -join '; ')") | Out-Null
  }

  $fieldMap = @{
    prompt       = @("prompt", "user_prompt", "text")
    response     = @("response", "agent_response", "content")
    thought      = @("thought", "agent_thought")
    shellCommand = @("command", "shell_command")
    toolInput    = @("tool_input", "input", "arguments")
    toolOutput   = @("tool_output", "output", "result")
  }

  foreach ($section in $fieldMap.Keys) {
    $enabled = $true
    if ($Config.includeFields -and ($Config.includeFields.PSObject.Properties.Name -contains $section)) {
      $enabled = [bool]$Config.includeFields.$section
    }
    if (-not $enabled) { continue }

    foreach ($field in $fieldMap[$section]) {
      if ($Payload.PSObject.Properties.Name -contains $field -and -not [string]::IsNullOrWhiteSpace([string]$Payload.$field)) {
        $lines.Add("$field`:") | Out-Null
        $lines.Add((Truncate-Text ([string]$Payload.$field) ([int]$Config.maxCharsPerField))) | Out-Null
      }
    }
  }

  foreach ($field in @("file_path", "path", "tool_name", "status", "error", "exit_code")) {
    if ($Payload.PSObject.Properties.Name -contains $field -and -not [string]::IsNullOrWhiteSpace([string]$Payload.$field)) {
      $lines.Add("$field`: $([string]$Payload.$field)") | Out-Null
    }
  }

  if ($Payload.PSObject.Properties.Name -contains "old_string") {
    $lines.Add("old_string:") | Out-Null
    $lines.Add((Truncate-Text ([string]$Payload.old_string) ([int]$Config.maxCharsPerField))) | Out-Null
  }

  if ($Payload.PSObject.Properties.Name -contains "new_string") {
    $lines.Add("new_string:") | Out-Null
    $lines.Add((Truncate-Text ([string]$Payload.new_string) ([int]$Config.maxCharsPerField))) | Out-Null
  }

  $text = ($lines -join "`n")
  return (Truncate-Text (Redact-Text $text $Config) ([int]$Config.maxTotalCharsPerEntry))
}

if (-not [string]::IsNullOrWhiteSpace($InputJson)) {
  $raw = $InputJson
} else {
  $raw = [Console]::In.ReadToEnd()
}
if ([string]::IsNullOrWhiteSpace($raw)) { $raw = "{}" }

try {
  $payload = $raw | ConvertFrom-Json
} catch {
  $payload = [pscustomobject]@{}
}

$eventName = ""
if ($payload.PSObject.Properties.Name -contains "hook_event_name") {
  $eventName = [string]$payload.hook_event_name
}

try {
  $config = Get-Config
  $pageId = [string]$config.targetPageId
  if (-not [string]::IsNullOrWhiteSpace($pageId)) {
    $key = Get-DedupeKey $payload
    if (-not (Test-And-Remember-Dedupe $key $config)) {
      $heading = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') UTC | $eventName"
      $body = Convert-PayloadToLogText $payload $config
      Invoke-NotionAppend -PageId $pageId -Heading $heading -Body $body -Config $config
    }
  }
} catch {
  $errPath = Join-Path $PSScriptRoot ".notion-log-errors.log"
  "$(Get-Date -Format o) $eventName $($_.Exception.Message)" | Add-Content -Path $errPath
}

Get-HookStdoutResponse $eventName

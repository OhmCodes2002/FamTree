$ErrorActionPreference = "Stop"
$script = Join-Path $PSScriptRoot "log-to-notion.ps1"

function Invoke-Hook([string]$Json) {
  return (& $script -InputJson $Json)
}

$tests = @(
  @{ name = "default"; json = '{}'; expected = '{}' }
  @{ name = "beforeSubmitPrompt"; json = '{"hook_event_name":"beforeSubmitPrompt"}'; expected = '{"continue":true}' }
  @{ name = "beforeShellExecution"; json = '{"hook_event_name":"beforeShellExecution"}'; expected = '{"permission":"allow"}' }
  @{ name = "preToolUse"; json = '{"hook_event_name":"preToolUse"}'; expected = '{"permission":"allow"}' }
  @{ name = "afterAgentResponse"; json = '{"hook_event_name":"afterAgentResponse","response":"hello"}'; expected = '{}' }
)

$failed = 0
foreach ($t in $tests) {
  $out = (Invoke-Hook $t.json).Trim()
  if ($out -ne $t.expected) {
    Write-Host "FAIL $($t.name): expected '$($t.expected)' got '$out'"
    $failed++
  } else {
    Write-Host "PASS $($t.name)"
  }
}

# Fail-open: no target page configured should still return valid hook JSON
$out = (Invoke-Hook '{"hook_event_name":"afterAgentResponse","response":"fail-open-check"}').Trim()
if ($out -ne '{}') {
  Write-Host "FAIL fail-open: expected '{}' got '$out'"
  $failed++
} else {
  Write-Host "PASS fail-open"
}

if ($failed -gt 0) { exit 1 }
Write-Host "All validation checks passed."

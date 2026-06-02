# Run once in PowerShell *as Administrator* so phones on Wi-Fi can reach Vite.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/open-lan-firewall.ps1

$ports = @(5173, 4173)
foreach ($port in $ports) {
  $name = "Famtree Vite port $port"
  $existing = Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "Rule already exists: $name"
    continue
  }
  New-NetFirewallRule -DisplayName $name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port | Out-Null
  Write-Host "Added firewall rule: $name"
}

$ip = (
  Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' } |
  Select-Object -First 1 -ExpandProperty IPAddress
)
if (-not $ip) {
  $ip = 'YOUR_LAPTOP_IP'
}
Write-Host ""
Write-Host "On your phone, open:"
Write-Host "  Dev:     http://${ip}:5173"
Write-Host "  Preview: http://${ip}:4173"
Write-Host ""
Write-Host "Do NOT use localhost on the phone."

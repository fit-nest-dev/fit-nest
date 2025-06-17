# PowerShell script to update EC2 connection details

# Function to test if a host is reachable on a specific port
function Test-HostPort {
    param(
        [string]$hostname,
        [int]$port = 22,
        [int]$timeoutMs = 5000
    )
    
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $result = $client.BeginConnect($hostname, $port, $null, $null)
        $success = $result.AsyncWaitHandle.WaitOne($timeoutMs, $true)
        
        if ($success) {
            $client.EndConnect($result)
            $client.Close()
            return $true
        } else {
            $client.Close()
            return $false
        }
    }
    catch {
        return $false
    }
}

# Current EC2 instance address - confirmed from AWS console
$currentEC2 = "ec2-3-25-65-100.ap-southeast-2.compute.amazonaws.com"
$currentUsername = "ubuntu" # Default for Amazon Linux/Ubuntu AMIs

Write-Host "Current EC2 configuration:" -ForegroundColor Cyan
Write-Host "Host: $currentEC2" -ForegroundColor Cyan
Write-Host "Username: $currentUsername" -ForegroundColor Cyan
Write-Host "PEM file: fit-nest.pem" -ForegroundColor Cyan

# Test current configuration
Write-Host "`nTesting connection to current EC2 instance..." -ForegroundColor Yellow
$ip = [System.Net.Dns]::GetHostAddresses($currentEC2) | Select-Object -First 1 -ExpandProperty IPAddressToString
if (Test-HostPort -hostname $ip -port 22) {
    Write-Host "Current EC2 instance is reachable on port 22!" -ForegroundColor Green
} else {
    Write-Host "Cannot reach current EC2 instance on port 22." -ForegroundColor Red
    
    # Ask for updated EC2 details
    Write-Host "`nPlease update your EC2 details:" -ForegroundColor Yellow
    $newEC2 = Read-Host "Enter new EC2 public DNS or IP (press Enter to keep current)"
    if ([string]::IsNullOrWhiteSpace($newEC2)) {
        $newEC2 = $currentEC2
    }
    
    $newUsername = Read-Host "Enter username (press Enter for 'ubuntu')"
    if ([string]::IsNullOrWhiteSpace($newUsername)) {
        $newUsername = "ubuntu"
    }
    
    # Test new configuration
    Write-Host "`nTesting connection to new EC2 instance..." -ForegroundColor Yellow
    try {
        $newIp = [System.Net.Dns]::GetHostAddresses($newEC2) | Select-Object -First 1 -ExpandProperty IPAddressToString
        if (Test-HostPort -hostname $newIp -port 22) {
            Write-Host "New EC2 instance is reachable on port 22!" -ForegroundColor Green
            
            # Update deploy.ps1 with new details
            Write-Host "`nUpdating deploy.ps1 with new EC2 details..." -ForegroundColor Yellow
            $deployScript = Get-Content -Path "deploy.ps1" -Raw
            $deployScript = $deployScript -replace "ec2Instance = `".*@.*`"", "ec2Instance = `"$newUsername@$newEC2`""
            Set-Content -Path "deploy.ps1" -Value $deployScript
            
            Write-Host "`ndeploy.ps1 updated successfully!" -ForegroundColor Green
            Write-Host "New connection string: $newUsername@$newEC2" -ForegroundColor Green
        } else {
            Write-Host "Cannot reach new EC2 instance on port 22 either." -ForegroundColor Red
            Write-Host "Please check your AWS console to verify the instance is running and has the correct security group settings." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Error resolving hostname: $_" -ForegroundColor Red
        Write-Host "Please make sure you entered a valid hostname or IP address." -ForegroundColor Yellow
    }
}

# AWS Console guidance
Write-Host "`n=== AWS EC2 Troubleshooting Steps ===" -ForegroundColor Cyan
Write-Host "1. Log into AWS Management Console" -ForegroundColor White
Write-Host "2. Go to EC2 service" -ForegroundColor White
Write-Host "3. Check if your instance is in 'running' state" -ForegroundColor White
Write-Host "4. Note the current 'Public IPv4 DNS' or 'Public IPv4 address'" -ForegroundColor White
Write-Host "5. Check Security Groups:" -ForegroundColor White
Write-Host "   - Click on the instance" -ForegroundColor White
Write-Host "   - Go to the 'Security' tab" -ForegroundColor White
Write-Host "   - Click on the security group name (launch-wizard-1)" -ForegroundColor White
Write-Host "   - Go to 'Inbound rules' tab" -ForegroundColor White
Write-Host "   - Edit inbound rules" -ForegroundColor White
Write-Host "   - Ensure there's a rule allowing SSH (port 22) from your IP address" -ForegroundColor White
Write-Host "   - Click 'Add rule' and set: Type=SSH, Source=My IP" -ForegroundColor White
Write-Host "6. Check Status Checks (Your instance shows 1/2 checks passed):" -ForegroundColor Yellow
Write-Host "   - Select your instance" -ForegroundColor White
Write-Host "   - Go to 'Status checks' tab" -ForegroundColor White
Write-Host "   - If system status check failed, the AWS infrastructure may have issues" -ForegroundColor White
Write-Host "   - If instance status check failed, try rebooting the instance:" -ForegroundColor White
Write-Host "      a. Right-click the instance" -ForegroundColor White
Write-Host "      b. Select 'Instance state' → 'Reboot'" -ForegroundColor White
Write-Host "7. If you still can't connect after fixing security groups and rebooting:" -ForegroundColor White
Write-Host "   - Try stopping and starting the instance (may change public IP)" -ForegroundColor White
Write-Host "   - Check instance console output for boot errors" -ForegroundColor White

Write-Host "`nYour current public IP address is: " -NoNewline -ForegroundColor Cyan
try {
    $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
    Write-Host $publicIP -ForegroundColor Green
} catch {
    Write-Host "Could not determine" -ForegroundColor Red
}

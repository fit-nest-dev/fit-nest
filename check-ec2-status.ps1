# PowerShell script to check the status of your application on EC2

$ec2Ip = "3.25.65.100"
$frontendPort = "80"
$backendPort = "5000"

function Test-WebsiteAvailability {
    param (
        [string]$url
    )
    
    try {
        $request = [System.Net.WebRequest]::Create($url)
        $request.Timeout = 5000
        $request.Method = "HEAD"
        
        try {
            $response = $request.GetResponse()
            $status = [int]$response.StatusCode
            $response.Close()
            
            return $status -lt 400
        }
        catch [System.Net.WebException] {
            return $false
        }
    }
    catch {
        return $false
    }
}

Write-Host "=== Checking Fit-Nest Application Status ===" -ForegroundColor Cyan

# Check frontend
Write-Host "`nChecking frontend on port $frontendPort..." -ForegroundColor Yellow
$frontendUrl = "http://${ec2Ip}:${frontendPort}"
if (Test-WebsiteAvailability -url $frontendUrl) {
    Write-Host "✅ Frontend is UP at $frontendUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend is DOWN at $frontendUrl" -ForegroundColor Red
}

# Also check port 3000 as an alternative
Write-Host "`nChecking frontend on port 3000 (alternative)..." -ForegroundColor Yellow
$frontendAltUrl = "http://${ec2Ip}:3000"
if (Test-WebsiteAvailability -url $frontendAltUrl) {
    Write-Host "✅ Frontend is UP at $frontendAltUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend is DOWN at $frontendAltUrl" -ForegroundColor Red
}

# Check backend
Write-Host "`nChecking backend..." -ForegroundColor Yellow
$backendUrl = "http://${ec2Ip}:${backendPort}"
if (Test-WebsiteAvailability -url $backendUrl) {
    Write-Host "✅ Backend is UP at $backendUrl" -ForegroundColor Green
} else {
    Write-Host "❌ Backend is DOWN at $backendUrl" -ForegroundColor Red
}

Write-Host "`n=== Troubleshooting Options ===" -ForegroundColor Cyan
Write-Host "1. Check EC2 security groups to ensure ports 80, 3000, and 5000 are open" -ForegroundColor White
Write-Host "2. Check container logs on EC2 with:" -ForegroundColor White
Write-Host "   ssh -i fit-nest.pem ubuntu@ec2-3-25-65-100.ap-southeast-2.compute.amazonaws.com 'sudo docker logs fit-nest-frontend'" -ForegroundColor White
Write-Host "   ssh -i fit-nest.pem ubuntu@ec2-3-25-65-100.ap-southeast-2.compute.amazonaws.com 'sudo docker logs fit-nest-backend'" -ForegroundColor White
Write-Host "3. Re-deploy using the ec2-deploy.ps1 script" -ForegroundColor White

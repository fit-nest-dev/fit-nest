# PowerShell script for Windows users to deploy Fit-Nest application

# Parameters
$dockerHubUsername = "shlokkk"  # Use your actual Docker Hub username
$ec2Instance = "ubuntu@ec2-3-25-65-100.ap-southeast-2.compute.amazonaws.com"
$pemFile = "fit-nest.pem"

# Function to test SSH connection
function Test-SSHConnection {
    Write-Host "Setting correct permissions for $pemFile..." -ForegroundColor Yellow
    icacls $pemFile /reset
    icacls $pemFile /inheritance:r /grant:r "$($env:USERNAME):(R)"

    Write-Host "Testing SSH connection to $ec2Instance..." -ForegroundColor Yellow
    try {
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = "ssh"
        $pinfo.Arguments = "-i `"$pemFile`" -o ConnectTimeout=10 $ec2Instance echo `"Connection successful`""
        $pinfo.RedirectStandardError = $true
        $pinfo.RedirectStandardOutput = $true
        $pinfo.UseShellExecute = $false
        $p = New-Object System.Diagnostics.Process
        $p.StartInfo = $pinfo
        $p.Start() | Out-Null
        $p.WaitForExit()

        if ($p.ExitCode -eq 0) {
            Write-Host "SSH connection successful!" -ForegroundColor Green
            return $true
        } else {
            $stderr = $p.StandardError.ReadToEnd()
            Write-Host "SSH connection failed: $stderr" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "Error testing SSH connection: $_" -ForegroundColor Red
        return $false
    }
}

# Check if we should just test the connection
if ($args -contains "-test") {
    Test-SSHConnection
    exit
}

Write-Host "Building and pushing Docker images..." -ForegroundColor Green

# Login to Docker Hub
Write-Host "Logging into Docker Hub - enter your credentials when prompted" -ForegroundColor Cyan
docker login

# Build and push backend
Write-Host "Building backend image..." -ForegroundColor Yellow
docker build -t $dockerHubUsername/fit-nest-backend:latest -f backend/Dockerfile .
docker push $dockerHubUsername/fit-nest-backend:latest

# Build and push frontend
Write-Host "Building frontend image..." -ForegroundColor Yellow
docker build -t $dockerHubUsername/fit-nest-frontend:latest -f frontend/Dockerfile .
docker push $dockerHubUsername/fit-nest-frontend:latest

# Compose section to embed in remote script
$composeYml = @"
version: '3.8'

services:
  backend:
    image: $dockerHubUsername/fit-nest-backend:latest
    container_name: fit-nest-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000

  frontend:
    image: $dockerHubUsername/fit-nest-frontend:latest
    container_name: fit-nest-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "3000:80"
"@

# Remote bash script (no interpolation)
$tempScript = @'
#!/bin/bash
set -x

if ! command -v docker &> /dev/null; then
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  sudo apt-get update
  sudo apt-get install -y docker-ce
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker ubuntu
fi

if ! command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE_VERSION=v2.24.6
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)
  sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$OS-$ARCH" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

mkdir -p ~/fit-nest
cd ~/fit-nest

cat > docker-compose.yml << 'EOF'
'@ + "`n$composeYml`n" + @'
EOF

docker-compose pull
docker-compose up -d
echo "Deployment completed!"
'@

# Write to a temporary file
$tempScriptPath = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tempScriptPath -Value $tempScript

# Test SSH
Write-Host "Testing SSH connection to the server..." -ForegroundColor Yellow
$sshSuccess = Test-SSHConnection
if (-not $sshSuccess) {
    Write-Host "Cannot proceed with deployment due to SSH connection issues." -ForegroundColor Red
    Write-Host "Please check the following:" -ForegroundColor Yellow
    Write-Host "1. Your EC2 instance is running"
    Write-Host "2. Security group allows SSH (port 22) from your IP address"
    Write-Host "3. Try running: .\deploy.ps1 -test"
    $runLocal = Read-Host "Would you like to run the application locally instead? (y/n)"
    if ($runLocal -eq "y") {
        Write-Host "Starting local deployment..." -ForegroundColor Green
        & ".\run-local.ps1"
    }
    exit 1
}

# Deploy
try {
    Write-Host "SSH connection successful. Deploying files..." -ForegroundColor Green

    ssh -i $pemFile $ec2Instance "mkdir -p ~/deployment"
    scp -i $pemFile $tempScriptPath "$ec2Instance`:~/deployment/deploy.sh"
    ssh -i $pemFile $ec2Instance "chmod +x ~/deployment/deploy.sh && ~/deployment/deploy.sh"

    Write-Host "Deployment successful!" -ForegroundColor Green
}
catch {
    Write-Host "Error during EC2 connection or deployment:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host "1. Ensure your EC2 instance is running"
    Write-Host "2. Security group allows SSH access"
    Write-Host "3. Verify your .pem file path and permissions"
}

# Cleanup
Remove-Item $tempScriptPath

Write-Host "Deployment script completed!" -ForegroundColor Green

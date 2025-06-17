# PowerShell script for deploying directly to EC2 (simplified version)

# Parameters
$dockerHubUsername = "shlokkk"
$ec2Instance = "ubuntu@ec2-3-25-65-100.ap-southeast-2.compute.amazonaws.com"
$pemFile = "fit-nest.pem"

Write-Host "Setting permissions for PEM file..." -ForegroundColor Yellow
# Set proper permissions for the PEM file
icacls $pemFile /reset
icacls $pemFile /inheritance:r /grant:r "$($env:USERNAME):(R)"

Write-Host "Testing SSH connection..." -ForegroundColor Yellow
$sshTest = ssh -i $pemFile -o ConnectTimeout=10 $ec2Instance "echo Connection successful"

if ($LASTEXITCODE -ne 0) {
    Write-Host "SSH connection failed. Cannot deploy to EC2." -ForegroundColor Red
    exit 1
}

Write-Host "SSH connection successful!" -ForegroundColor Green

# Create a deployment script with explicit steps
$deployScript = @'
#!/bin/bash
set -e

echo "=== Starting deployment on EC2 ==="

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  sudo apt-get update
  sudo apt-get install -y docker-ce
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker ubuntu
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
  echo "Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# Create docker-compose.yml file
echo "Creating docker-compose.yml file..."
cat > ~/docker-compose.yml << 'EOL'
version: '3.8'

services:
  backend:
    image: shlokkk/fit-nest-backend:latest
    container_name: fit-nest-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000

  frontend:
    image: shlokkk/fit-nest-frontend:latest
    container_name: fit-nest-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "80:80"
      - "3000:80"
EOL

echo "Pulling Docker images..."
sudo docker-compose -f ~/docker-compose.yml pull

echo "Starting containers..."
sudo docker-compose -f ~/docker-compose.yml up -d

echo "Checking if containers are running..."
sudo docker ps

echo "=== Deployment complete ==="
'@

# Save the script to a temporary file
$tempFile = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tempFile -Value $deployScript

Write-Host "Transferring deployment script to server..." -ForegroundColor Yellow
# Copy the script to the server
scp -i $pemFile $tempFile "$ec2Instance`:~/deploy.sh"

Write-Host "Setting permissions and running deployment script..." -ForegroundColor Yellow
# Make it executable and run it
ssh -i $pemFile $ec2Instance "chmod +x ~/deploy.sh && bash ~/deploy.sh"

# Clean up
Remove-Item $tempFile

Write-Host "`nDeployment completed! Your application should now be accessible at:" -ForegroundColor Green
Write-Host "Frontend: http://3.25.65.100" -ForegroundColor Cyan
Write-Host "Backend API: http://3.25.65.100:5000" -ForegroundColor Cyan

# PowerShell script to run the application locally using Docker Compose

Write-Host "Starting local deployment of Fit-Nest application..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Docker is not installed or not running. Please install Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Building the images locally
Write-Host "`nBuilding Docker images locally..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build Docker images. Please check the errors above." -ForegroundColor Red
    exit 1
}

# Create a local .env file for development if it doesn't exist
if (-not (Test-Path "backend/.env")) {
    Write-Host "`nCreating a local .env file for development..." -ForegroundColor Yellow
    @"
# MongoDB Connection - update with your actual MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fit-nest

# JWT Secret for Authentication
JWT_SECRET=local_development_secret_key
JWT_EXPIRES_IN=30d

# Node Environment
NODE_ENV=development

# Server Port
PORT=5000

# Add other necessary environment variables for your application
"@ | Out-File -FilePath "backend/.env" -Encoding utf8
    
    Write-Host "Created backend/.env file. Please update it with your actual MongoDB connection string." -ForegroundColor Yellow
}

# Starting the containers
Write-Host "`nStarting containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start containers. Please check the errors above." -ForegroundColor Red
    exit 1
}

# Check if containers are running
$backendRunning = docker ps --filter "name=fit-nest-backend" --format "{{.Names}}" | Where-Object { $_ -eq "fit-nest-backend" }
$frontendRunning = docker ps --filter "name=fit-nest-frontend" --format "{{.Names}}" | Where-Object { $_ -eq "fit-nest-frontend" }

if ($backendRunning -and $frontendRunning) {
    Write-Host "`n✅ Fit-Nest application is running locally!" -ForegroundColor Green
    Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
    
    # Open browser to the frontend
    Start-Process "http://localhost:3000"
} else {
    Write-Host "`n⚠️ Some containers are not running:" -ForegroundColor Yellow
    if (-not $backendRunning) { Write-Host "Backend is not running" -ForegroundColor Red }
    if (-not $frontendRunning) { Write-Host "Frontend is not running" -ForegroundColor Red }
    
    Write-Host "`nChecking container logs:" -ForegroundColor Yellow
    Write-Host "`nBackend logs:" -ForegroundColor Cyan
    docker logs fit-nest-backend --tail 20
    Write-Host "`nFrontend logs:" -ForegroundColor Cyan
    docker logs fit-nest-frontend --tail 20
}

Write-Host "`nCommands to manage your local deployment:" -ForegroundColor Magenta
Write-Host "View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "Stop application: docker-compose down" -ForegroundColor White
Write-Host "Restart application: docker-compose restart" -ForegroundColor White

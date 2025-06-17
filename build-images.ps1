# PowerShell script for building and pushing Docker images only

# Parameters
$dockerHubUsername = "shlokkk"  # Use your actual Docker Hub username

Write-Host "Building and pushing Docker images..." -ForegroundColor Green

# Login to Docker Hub first - this is required
Write-Host "Logging into Docker Hub - enter your credentials when prompted" -ForegroundColor Cyan
docker login

# Build and tag the backend image
Write-Host "Building backend image..." -ForegroundColor Yellow
docker build -t $dockerHubUsername/fit-nest-backend:latest -f backend/Dockerfile .

if ($?) {
    Write-Host "Backend image built successfully. Pushing to Docker Hub..." -ForegroundColor Green
    docker push $dockerHubUsername/fit-nest-backend:latest
} else {
    Write-Host "Failed to build backend image." -ForegroundColor Red
}

# Build and tag the frontend image
Write-Host "Building frontend image..." -ForegroundColor Yellow
docker build -t $dockerHubUsername/fit-nest-frontend:latest -f frontend/Dockerfile .

if ($?) {
    Write-Host "Frontend image built successfully. Pushing to Docker Hub..." -ForegroundColor Green
    docker push $dockerHubUsername/fit-nest-frontend:latest
} else {
    Write-Host "Failed to build frontend image." -ForegroundColor Red
}

Write-Host "Done! Images have been built and pushed to Docker Hub." -ForegroundColor Green

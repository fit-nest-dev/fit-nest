#!/bin/bash

# Build and push Docker images to Docker Hub
# Replace 'yourusername' with your Docker Hub username


# Log in to Docker Hub (you'll need to do this once)
# docker login

# Build and tag the backend image
docker build -t shlokkk/fit-nest-backend:latest -f backend/Dockerfile .
docker push shlokkk/fit-nest-backend:latest

# Build and tag the frontend image
docker build -t shlokkk/fit-nest-frontend:latest -f frontend/Dockerfile .
docker push shlokkk/fit-nest-frontend:latest

# Connect to EC2 and deploy
echo "Deploying to EC2 instance..."
ssh -i "fit-nest.pem" ubuntu@ec2-3-25-65-100.ap-southeast-2.compute.amazonaws.com << 'EOF'
  # Install Docker if not installed (optional, if your EC2 doesn't have Docker yet)
  if ! [ -x "$(command -v docker)" ]; then
    echo "Installing Docker..."
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

  # Install Docker Compose if not installed
  if ! [ -x "$(command -v docker-compose)" ]; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
  fi

  # Create or update docker-compose.yml file
  cat > docker-compose.yml << 'INNEREOF'
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
      # Add other environment variables here

  frontend:
    image: shlokkk/fit-nest-frontend:latest
    container_name: fit-nest-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "3000:80"
INNEREOF

  # Pull latest images and restart containers
  docker-compose pull
  docker-compose up -d

  echo "Deployment completed!"
EOF

echo "Deployment script executed!"
echo "Building and pushing Docker images..."

#!/bin/bash

# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Change to the fit-nest directory
cd ~/fit-nest

# Pull latest changes if using a git repository
# git pull origin main

# Create backup of .env files if they don't exist on the server
if [ ! -f ./backend/.env ]; then
  echo "Creating sample backend .env file. Please update with your actual values."
  cat > ./backend/.env << EOL
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
# Add any other environment variables needed for your app
EOL
fi

# Build and start the Docker containers
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Output status
echo "Deployment completed at $(date)"
echo "Frontend is available at http://localhost:3000"
echo "Backend API is available at http://localhost:5000"

# Check if containers are running
echo "Container status:"
sudo docker-compose ps

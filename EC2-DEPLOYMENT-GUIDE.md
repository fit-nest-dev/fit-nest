# EC2 Deployment Troubleshooting Guide

## Current Status
- Docker images have been successfully built and pushed to Docker Hub
  - Backend: `shlokkk/fit-nest-backend:latest`
  - Frontend: `shlokkk/fit-nest-frontend:latest`
- SSH connection to the EC2 instance is failing with a timeout

## Troubleshooting Steps for EC2

### 1. Check Instance Status
- Instance status check is showing "1/2 checks passed"
- This indicates there might be an issue with the instance itself

### 2. Try Rebooting the Instance
1. Go to AWS EC2 Console
2. Select your instance (i-04b970832c85554ce)
3. Click "Instance state" → "Reboot"
4. Wait 2-3 minutes for the instance to restart
5. Check if both status checks pass after reboot

### 3. If Reboot Doesn't Help
1. Go to AWS EC2 Console
2. Select your instance
3. Click "Instance state" → "Stop instance"
4. Wait until it's fully stopped
5. Click "Instance state" → "Start instance"
6. Note that this will change your public IP address
7. Update your deployment script with the new IP/DNS

### 4. Check Console Output
1. Go to AWS EC2 Console
2. Select your instance
3. Click "Actions" → "Monitor and troubleshoot" → "Get system log"
4. Check for any errors during boot

### 5. Security Group
Your security group already has SSH access allowed from any IP address (0.0.0.0/0), so that's not the issue.

## Running Locally

While troubleshooting the EC2 instance, you can run the application locally using:

```powershell
.\run-local.ps1
```

This will:
- Create a default .env file if it doesn't exist (you'll need to update with your MongoDB URI)
- Build and run both frontend and backend containers
- Make the application available at: http://localhost:3000
- Make the API available at: http://localhost:5000

## Manual Deployment via AWS Console

If you can't get SSH working, you can still deploy manually:

1. Log into the AWS EC2 Console
2. Connect to your instance using "EC2 Instance Connect" (browser-based SSH)
3. Run the following commands:

```bash
# Install Docker if not already installed
sudo apt-get update
sudo apt-get install -y docker.io

# Install Docker Compose
sudo apt-get install -y docker-compose

# Create docker-compose.yml file
cat > docker-compose.yml << 'EOF'
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
EOF

# Create .env file for the backend
mkdir -p backend
cat > backend/.env << 'EOF'
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fit-nest

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d

# Node Environment
NODE_ENV=production

# Server Port
PORT=5000
EOF

# Pull and run the containers
sudo docker-compose pull
sudo docker-compose up -d
```

4. Update the MongoDB URI and JWT secret in the .env file

Your application should now be running on your EC2 instance at:
- Frontend: http://3.25.65.100:3000
- Backend API: http://3.25.65.100:5000

# Step-by-Step AWS EC2 Deployment Guide for Fit-Nest

## Prerequisites:
1. An AWS account
2. An EC2 instance running (t2.micro or larger recommended)
3. The `fit-nest.pem` key file for SSH access
4. Basic understanding of terminal commands

## Step 1: Launch and Configure Your EC2 Instance

1. Log into the AWS Management Console
2. Navigate to EC2 Dashboard
3. Launch a new EC2 instance with:
   - Ubuntu Server 22.04 LTS
   - At least t2.micro instance type (t2.medium recommended for better performance)
   - Enable public IP
   - Configure security group to allow the following inbound traffic:
     - SSH (port 22)
     - HTTP (port 80)
     - Custom TCP (port 3000)
     - Custom TCP (port 5000)
   - Use your existing `fit-nest.pem` key pair
   - Add storage: at least 20GB

## Step 2: Connect to Your EC2 Instance

1. Open a terminal on your local machine
2. Navigate to the directory where your `fit-nest.pem` file is located
3. Run the following commands:

```bash
# Set correct permissions for your key file
chmod 400 fit-nest.pem

# Connect to your EC2 instance (replace with your actual EC2 public DNS)
ssh -i fit-nest.pem ubuntu@your-ec2-public-dns
```

## Step 3: Install Docker and Docker Compose

Once connected to your EC2 instance, run the following commands:

```bash
# Update package listings
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Set up the Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Update package listings again with the new repository
sudo apt update

# Install Docker
sudo apt install -y docker-ce

# Add your user to the Docker group to run Docker without sudo
sudo usermod -aG docker ${USER}

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Make sure Docker service starts on boot
sudo systemctl enable docker
```

Log out and log back in to apply the group changes:

```bash
exit
```

Then SSH back into your instance:

```bash
ssh -i fit-nest.pem ubuntu@your-ec2-public-dns
```

## Step 4: Transfer Project Files to EC2

On your local machine, open a new terminal and navigate to your project directory:

```bash
# Create the directory structure on the EC2 instance
ssh -i fit-nest.pem ubuntu@your-ec2-public-dns "mkdir -p ~/fit-nest/frontend ~/fit-nest/backend"

# Transfer deployment files
scp -i fit-nest.pem deploy.sh monitor.sh nginx.conf docker-compose.yml ubuntu@your-ec2-public-dns:~/fit-nest/

# Make scripts executable
ssh -i fit-nest.pem ubuntu@your-ec2-public-dns "chmod +x ~/fit-nest/deploy.sh ~/fit-nest/monitor.sh"

# Transfer frontend files
scp -i fit-nest.pem -r frontend/* ubuntu@your-ec2-public-dns:~/fit-nest/frontend/

# Transfer backend files
scp -i fit-nest.pem -r backend/* ubuntu@your-ec2-public-dns:~/fit-nest/backend/
```

## Step 5: Set Up Environment Variables

1. Create and configure your .env files on the EC2 instance:

```bash
ssh -i fit-nest.pem ubuntu@your-ec2-public-dns

# Create backend .env file
cat > ~/fit-nest/backend/.env << EOL
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
# Add any other required environment variables
EOL

# Create frontend .env file if needed
cat > ~/fit-nest/frontend/.env << EOL
VITE_API_URL=http://your-ec2-public-dns/api
EOL
```

Replace placeholders with your actual configuration values.

## Step 6: Deploy the Application

Run the deployment script:

```bash
cd ~/fit-nest
./deploy.sh
```

This script will:
1. Set up the environment if needed
2. Build Docker images for frontend and backend
3. Start the containers with Docker Compose

## Step 7: Set Up Nginx as a Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Copy our Nginx configuration
sudo cp ~/fit-nest/nginx.conf /etc/nginx/nginx.conf

# Test Nginx configuration
sudo nginx -t

# Restart Nginx to apply changes
sudo systemctl restart nginx

# Make sure Nginx starts on boot
sudo systemctl enable nginx
```

## Step 8: Monitor Your Application

You can run the monitoring script to check the status of your application:

```bash
cd ~/fit-nest
./monitor.sh
```

## Step 9: Set Up Automatic Monitoring (Optional)

Set up a cron job to run the monitor script periodically:

```bash
# Open crontab editor
crontab -e

# Add this line to run monitoring every hour and log results
0 * * * * ~/fit-nest/monitor.sh >> ~/fit-nest/monitoring_logs.txt 2>&1
```

## Accessing Your Application

After successful deployment, your application should be accessible at:
- Frontend: http://your-ec2-public-dns
- Backend API: http://your-ec2-public-dns/api

## Troubleshooting

If you encounter issues:

1. Check container logs:
```bash
docker logs fitnest-frontend
docker logs fitnest-backend
```

2. Verify containers are running:
```bash
docker ps
```

3. Check Nginx status:
```bash
sudo systemctl status nginx
```

4. If services are not running, restart them:
```bash
cd ~/fit-nest
docker-compose restart
```

5. For persistent issues, rebuild the containers:
```bash
cd ~/fit-nest
docker-compose down
docker system prune -f
./deploy.sh
```

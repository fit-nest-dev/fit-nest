# Fit-Nest Application

This is a gym management application with frontend and backend components.

## Project Structure

- `frontend/`: React application built with Vite
- `backend/`: Node.js Express API server

## Docker Setup

This project is containerized with Docker for easy development and deployment.

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fit-nest.git
   cd fit-nest
   ```

2. Create a `.env` file in the backend directory using the `.env.example` as a template:
   ```
   cp backend/.env.example backend/.env
   ```

3. Start the development environment:
   ```
   docker-compose up
   ```

4. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://3.25.86.182:5000

### Deployment to AWS EC2

1. Make sure you have your AWS EC2 credentials and `.pem` file ready.

2. Modify the `deploy.sh` script with your Docker Hub username.

3. Run the deployment script:
   ```
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. The script will:
   - Build your Docker images
   - Push them to Docker Hub
   - Deploy them to your EC2 instance

## Manual Deployment

### Building Docker Images

```bash
# Build backend image
docker build -t fit-nest-backend -f backend/Dockerfile .

# Build frontend image
docker build -t fit-nest-frontend -f frontend/Dockerfile .
```

### Running Locally

```bash
# Run both services
docker-compose up

# Run in background
docker-compose up -d
```

### Stopping the Application

```bash
docker-compose down
```

## Environment Variables

All required environment variables are listed in the `.env.example` file. Make sure to set them properly for production deployment.

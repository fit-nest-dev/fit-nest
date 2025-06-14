#!/bin/bash

# Function to check if service is running
check_service() {
  local service_name=$1
  local container_name=$2
  local port=$3
  
  echo "Checking $service_name on port $port..."
  
  # Check if container is running
  if [ "$(docker ps -q -f name=^/${container_name}$)" ]; then
    echo "✅ $service_name container is running"
  else
    echo "❌ $service_name container is not running"
    echo "Attempting to restart $service_name..."
    cd ~/fit-nest
    docker-compose up -d $service_name
  fi
  
  # Check if port is accessible
  if curl -s "http://localhost:$port" > /dev/null; then
    echo "✅ $service_name is accessible on port $port"
  else
    echo "❌ $service_name is not accessible on port $port"
  fi
}

# Print header
echo "======================================"
echo "FitNest Application Monitoring"
echo "$(date)"
echo "======================================"
echo ""

# Check disk space
echo "Disk space usage:"
df -h | grep -E 'Filesystem|/dev/xvda1'
echo ""

# Check memory usage
echo "Memory usage:"
free -h
echo ""

# Check running containers
echo "Running containers:"
docker ps
echo ""

# Check specific services
check_service "Backend" "fitnest-backend" "5000"
check_service "Frontend" "fitnest-frontend" "3000"
echo ""

# Check docker logs for errors (last 10 lines)
echo "Recent backend logs:"
docker logs --tail 10 fitnest-backend
echo ""
echo "Recent frontend logs:"
docker logs --tail 10 fitnest-frontend
echo ""

# Show overall system status
echo "System load:"
uptime
echo ""

echo "======================================"
echo "Monitoring completed at $(date)"
echo "======================================" 

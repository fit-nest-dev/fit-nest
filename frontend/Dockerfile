# Stage 1: Build the Vite app
FROM node:20-alpine AS build

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --silent

# Copy source files
COPY frontend/ .

# Build the Vite app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files to Nginx html folder
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY frontend/nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
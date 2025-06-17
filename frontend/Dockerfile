FROM node:20-alpine AS build

WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package.json frontend/package-lock.json* frontend/npm-shrinkwrap.json* ./

# Install dependencies with cache optimization
RUN npm ci --silent && npm cache clean --force

# Copy only necessary source files
COPY frontend/index.html ./
COPY frontend/vite.config.js ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/public ./public/
COPY frontend/src ./src/

# Build the app with production optimization
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files from build stage
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration 
COPY frontend/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

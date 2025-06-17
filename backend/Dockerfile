FROM node:20-alpine

WORKDIR /app/backend

# Copy package files only first (better layer caching)
COPY backend/package.json backend/package-lock.json* backend/npm-shrinkwrap.json* ./

# Install production dependencies with cache optimization
RUN npm ci --only=production --silent && npm cache clean --force

# Copy backend files
COPY backend/ ./

# Make sure we're exposing the right port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]

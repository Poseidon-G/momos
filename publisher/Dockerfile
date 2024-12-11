# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and built files
COPY package*.json ./
COPY --from=builder /app/dist ./dist

# Install production deps
RUN npm ci --only=production

# Create logs directory with correct permissions
RUN mkdir -p /app/logs && \
    chown -R node:node /app && \
    chmod -R 755 /app/logs

# Debug: Verify permissions
RUN ls -la /app && \
    ls -la /app/logs

# Switch to non-root user
USER node

ENV NODE_ENV=production
EXPOSE 8000

# Start command with proper entry point
CMD ["node", "dist/index.js"]
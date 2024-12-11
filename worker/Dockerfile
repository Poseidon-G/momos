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

# Create logs directory and downloads with correct permissions
RUN mkdir -p logs && \
    chown -R node:node /app && \
    chmod -R 755 /app && \
    chmod 777 /app/logs

RUN mkdir -p downloads && \
    chown -R node:node /app && \
    chmod -R 755 /app && \
    chmod 777 /app/downloads


# Debug: Verify permissions
RUN ls -la /app && \
    ls -la /app/logs

# Switch to non-root user
USER node

ENV NODE_ENV=production

# Start command with proper entry point
CMD ["node", "dist/main.js"]
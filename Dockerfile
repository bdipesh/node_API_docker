# Multi-stage Docker build for Node.js TypeScript application

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./
# Ensure Prisma schema is available for postinstall (prisma generate)
COPY prisma ./prisma

# Install all dependencies (including devDependencies for building)
# postinstall runs `prisma generate`, which requires prisma/schema.prisma
RUN npm ci --only=production=false

# Copy remaining source code
COPY . .

# Generate Prisma client explicitly (harmless if already generated via postinstall)
RUN npx prisma generate

# Build the TypeScript application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy Prisma schema before installing deps so postinstall (prisma generate) can find it
COPY --from=builder /app/prisma ./prisma
# Copy package files
COPY package*.json ./

# Install only production dependencies
# postinstall runs `prisma generate`, which requires prisma/schema.prisma
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy environment files
COPY .env* ./

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]

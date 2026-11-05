# ==========================================
# Clash of Clans Real-Time Tracker Dockerfile
# ==========================================
FROM node:20-alpine

# Metadata
LABEL maintainer="Antigravity"
LABEL description="Clash of Clans Real-Time Upgrade & Multi-Profile Tracker"

# Create application directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/data

# Copy package manifests
COPY package.json ./

# Copy source code and static assets
COPY src/ ./src/

# Create persistent data volume mount point
RUN mkdir -p /app/data && chown -R node:node /app

# Use non-root node user for security
USER node

# Expose web application port
EXPOSE 3000

# Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start web application
CMD ["node", "src/server.js"]

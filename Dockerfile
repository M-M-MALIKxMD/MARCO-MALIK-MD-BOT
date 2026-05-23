# ============================================
#   MARCO MALIK MD WHATSAPP BOT - DOCKERFILE
# ============================================

FROM node:20-slim

# Install system dependencies for Puppeteer, ffmpeg & sharp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    chromium \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libatk1.0-0 \
    libcups2 \
    wget \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy all project files
COPY . .

# Create necessary directories
RUN mkdir -p session tmp data

# Expose web panel port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start the bot
CMD ["node", "index.js"]

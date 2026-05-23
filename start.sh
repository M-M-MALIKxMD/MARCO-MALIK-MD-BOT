#!/bin/bash
# ============================================
#   MARCO MALIK BOT - START SCRIPT
# ============================================

echo "╔══════════════════════════════════════╗"
echo "║   🤖 MARCO MALIK MD BOT     ║"
echo "║         Version 12.0.0               ║"
echo "║      Powered By: Marco Malik         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found! Copying from .env.example..."
  cp .env.example .env
  echo "✅ .env created. Please edit it with your details."
  echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo "✅ Dependencies installed!"
  echo ""
fi

# Create required directories
mkdir -p session tmp data

echo "🚀 Starting Marco Malik Bot..."
echo ""
node index.js

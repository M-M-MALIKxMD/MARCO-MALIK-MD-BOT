#!/bin/bash
# ============================================
#   MARCO MALIK BOT - INSTALL SCRIPT
# ============================================

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   📦 INSTALLING MARCO MALIK BOT      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ is required. Current: $(node --version 2>/dev/null || echo 'not found')"
  echo "   Download from: https://nodejs.org"
  exit 1
fi
echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed."
  exit 1
fi
echo "✅ npm $(npm --version) found"

# Check ffmpeg
if command -v ffmpeg &> /dev/null; then
  echo "✅ ffmpeg found"
else
  echo "⚠️  ffmpeg not found. Some media commands may not work."
  echo "   Install via: sudo apt install ffmpeg (Linux) or brew install ffmpeg (Mac)"
fi

# Create directories
echo ""
echo "📁 Creating directories..."
mkdir -p session tmp data panel/css panel/js
echo "✅ Directories created"

# Copy .env
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✅ .env file created from template"
  echo "⚠️  Please edit .env with your details before starting!"
else
  echo "ℹ️  .env already exists, skipping..."
fi

# Install dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
  echo ""
  echo "╔══════════════════════════════════════╗"
  echo "║   ✅ INSTALLATION COMPLETE!           ║"
  echo "╚══════════════════════════════════════╝"
  echo ""
  echo "📋 Next steps:"
  echo "   1. Edit your .env file: nano .env"
  echo "   2. Set your OWNER_NUMBER"
  echo "   3. Set your BOT_NAME"
  echo "   4. Run: bash start.sh"
  echo ""
  echo "🔱 Powered By Marco Malik"
else
  echo "❌ Installation failed. Check errors above."
  exit 1
fi

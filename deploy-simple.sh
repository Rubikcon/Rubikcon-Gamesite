#!/bin/bash

# Simple deployment script for permission issues
echo "🔧 Fixing permissions and deploying..."

# Fix permissions
sudo chown -R $USER:$USER /var/www/rubikcongames.xyz
chmod -R 755 /var/www/rubikcongames.xyz

# Pull latest code
git pull origin main

# Set production environment
export NODE_ENV=production

# Clean npm cache
npm cache clean --force

# Install dependencies
echo "📦 Installing server dependencies..."
npm install

# Build and install client
echo "🏗️ Building client..."
cd client
npm install
# Copy production env file
cp ../.env.production .env.production 2>/dev/null || echo "No .env.production found, using .env"
# Build with production settings
NODE_ENV=production npm run build
cd ..

# Build server
echo "🔨 Building server..."
npm run build

# Restart PM2
pm2 restart rubikcon-games

echo "✅ Deployment complete!"
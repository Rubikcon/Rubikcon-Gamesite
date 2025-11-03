#!/bin/bash

# Deployment script for Hostinger VPS
echo "🚀 Starting deployment to Hostinger VPS..."

# Update code from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build client
echo "🏗️ Building client..."
cd client
npm install
npm run build
cd ..

# Restart application
echo "🔄 Restarting application..."
pm2 restart rubikcon-games || pm2 start npm --name "rubikcon-games" -- start

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
echo "🌐 Your website should be live at: https://rubikcongames.xyz"
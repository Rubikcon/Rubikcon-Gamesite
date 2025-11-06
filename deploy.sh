#!/bin/bash

# Deployment script for Hostinger VPS
echo "🚀 Starting deployment to Hostinger VPS..."

# Set proper permissions
echo "🔧 Setting permissions..."
chmod -R 755 .
chown -R $USER:$USER .

# Update code from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Clean npm cache and node_modules
echo "🧹 Cleaning cache..."
npm cache clean --force
rm -rf node_modules client/node_modules

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build client with proper permissions
echo "🏗️ Building client..."
cd client
npm install
chmod +x node_modules/.bin/*
npx vite build
cd ..

# Set production permissions
chmod -R 755 client/dist

# Restart application
echo "🔄 Restarting application..."
pm2 restart rubikcon-games || pm2 start npm --name "rubikcon-games" -- start

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
echo "🌐 Your website should be live at: https://rubikcongames.xyz"
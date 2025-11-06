#!/bin/bash

# Simple deployment script for permission issues
echo "🔧 Fixing permissions and deploying..."

# Fix permissions
sudo chown -R $USER:$USER /var/www/rubikcongames.xyz
chmod -R 755 /var/www/rubikcongames.xyz

# Pull latest code
git pull origin main

# Install and build
npm install
cd client
npm install
sudo npm run build
cd ..

# Restart PM2
pm2 restart rubikcon-games

echo "✅ Deployment complete!"
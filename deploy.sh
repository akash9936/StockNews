#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Clean up any existing PM2 processes
echo "Cleaning up existing PM2 processes..."
pm2 delete trendlyne-bot 2>/dev/null || true
pm2 flush 2>/dev/null || true

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" > .env
    echo "TELEGRAM_CHANNEL_ID=your_channel_id_here" >> .env
    echo "Please update the .env file with your actual credentials"
fi

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Show logs immediately
echo "Deployment completed! Showing logs..."
pm2 logs trendlyne-bot 
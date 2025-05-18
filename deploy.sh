#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

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

# Start or restart the application with PM2
echo "Starting application with PM2..."
if pm2 list | grep -q "trendlyne-bot"; then
    echo "Restarting existing application..."
    pm2 restart trendlyne-bot
else
    echo "Starting new application..."
    pm2 start ecosystem.config.js
fi

# Save PM2 process list
pm2 save

echo "Deployment completed! Check logs with: pm2 logs trendlyne-bot" 
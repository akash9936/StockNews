module.exports = {
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Cron job configuration
  cron: {
    enabled: process.env.CRON_ENABLED === 'true' || true,
    interval: parseInt(process.env.CRON_INTERVAL_MINUTES || '60', 10), // Default to 60 minutes
    timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
  },
  // Add any other app-specific configuration here
}; 
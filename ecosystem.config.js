module.exports = {
  apps: [{
    name: "trendlyne-bot",
    script: "src/index.js",
    watch: false,
    max_memory_restart: "1G",
    exp_backoff_restart_delay: 100,
    env: {
      "NODE_ENV": "production",
      "TELEGRAM_BOT_TOKEN": process.env.TELEGRAM_BOT_TOKEN,
      "TELEGRAM_CHANNEL_ID": process.env.TELEGRAM_CHANNEL_ID,
      "ENABLE_MARKET_INSIGHTS": "true",
      "ENABLE_INSIGHT_TRACKING": "false",
      "CRON_TIMEZONE": "Asia/Kolkata"
    },
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    log_file: "logs/combined.log",
    time: true
  }]
}; 
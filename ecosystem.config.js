module.exports = {
  apps: [{
    name: "trendlyne-bot",
    script: "src/index.js",
    watch: false,
    max_memory_restart: "1G",
    exp_backoff_restart_delay: 100,
    autorestart: false,
    max_restarts: 0,
    env: {
      "NODE_ENV": "production",
      "TELEGRAM_BOT_TOKEN": process.env.TELEGRAM_BOT_TOKEN,
      "TELEGRAM_CHANNEL_ID": process.env.TELEGRAM_CHANNEL_ID,
      "ENABLE_MARKET_INSIGHTS": "true",
      "ENABLE_INSIGHT_TRACKING": "false",
      "CRON_TIMEZONE": "Asia/Kolkata",
      "CRON_ENABLED": "true",
      "MARKET_INSIGHTS_CRON": "*/10 * * * *",
      "TOP_GAINERS_CRON": "*/10 * * * *",
      "TOP_LOSERS_CRON": "*/10 * * * *",
      "NEW_52W_LOW_CRON": "*/10 * * * *",
      "RELATIVE_OUTPERFORMANCE_CRON": "*/10 * * * *",
      "RELATIVE_UNDERPERFORMANCE_CRON": "*/10 * * * *",
      "HIGH_VOLUME_LOSERS_CRON": "*/10 * * * *"
    },
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    log_file: "logs/combined.log",
    time: true,
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
}; 
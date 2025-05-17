require('dotenv').config();

const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8069228318:AAH8JcGbvwkq7GSqHs3ZzkW1VCxWkpnN4JA',
    channelId: process.env.TELEGRAM_CHANNEL_ID || '@GoStockLive'
  },
  
  trendlyne: {
    url: process.env.TRENDLYNE_API_URL || 'https://trendlyne.com/equity/api/market-insight/',
    headers: {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'accept-language': 'en-GB,en;q=0.9',
      'referer': 'https://trendlyne.com/markets-today/',
      'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': process.env.TRENDLYNE_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'x-requested-with': 'XMLHttpRequest',
      'priority': 'u=1, i'
    }
  },

  app: {
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config; 
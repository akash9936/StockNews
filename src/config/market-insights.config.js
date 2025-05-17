module.exports = {
  // Market insights configuration
  marketInsights: {
    enabled: process.env.ENABLE_MARKET_INSIGHTS === 'true' || true,
    url: process.env.TRENDLYNE_API_URL || 'https://trendlyne.com/equity/api/market-insight/',
    cron: {
      schedule: process.env.MARKET_INSIGHTS_CRON || '*/15 * * * *', // Every 5 minutes by default
      timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
    }
  },

  // Screen insights configuration
  screens: [
    {
      id: '515750',
      title: 'Top Gainers Stocks',
      enabled: process.env.ENABLE_TOP_GAINERS === 'true' || true,
      cron: {
        schedule: process.env.TOP_GAINERS_CRON || '*/50 * * * *', // Every 5 minutes by default
        timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
      }
    },
    {
      id: '515751',
      title: 'Top Losers Stocks',
      enabled: process.env.ENABLE_TOP_LOSERS === 'true' || true,
      cron: {
        schedule: process.env.TOP_LOSERS_CRON || '*/50 * * * *', // Every 5 minutes by default
        timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
      }
    },
    {
      id: '515753',
      title: 'New 52 week Low',
      enabled: process.env.ENABLE_52W_LOW === 'true' || true,
      cron: {
        schedule: process.env.NEW_52W_LOW_CRON || '*/50 * * * *', // Every 5 minutes by default
        timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
      }
    },
    {
      id: '515755',
      title: 'Relative Outperformance versus Nifty 500 over 1 Week',
      enabled: process.env.ENABLE_RELATIVE_OUTPERFORMANCE === 'true' || true,
      cron: {
        schedule: process.env.RELATIVE_OUTPERFORMANCE_CRON || '*/50 * * * *', // Every 5 minutes by default
        timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
      }
    },
    {
      id: '515756',
      title: 'Relative Underperformance versus Nifty500 over 1 Week',
      enabled: process.env.ENABLE_RELATIVE_UNDERPERFORMANCE === 'true' || true,
      cron: {
        schedule: process.env.RELATIVE_UNDERPERFORMANCE_CRON || '*/50 * * * *', // Every 5 minutes by default
        timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
      }
    },
    {
      id: '515761',
      title: 'High Volume, Top Losers',
      enabled: process.env.ENABLE_HIGH_VOLUME_LOSERS === 'true' || true,
      cron: {
        schedule: process.env.HIGH_VOLUME_LOSERS_CRON || '*/50 * * * *', // Every 5 minutes by default
        timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
      }
    }
  ],
  
  // Base URL for the screener API
  baseUrl: 'https://trendlyne.com/fundamentals/json-screener',
  
  // Default request configuration
  requestConfig: {
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
  }
}; 
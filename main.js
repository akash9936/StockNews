
const axios = require('axios');
const querystring = require('querystring');
const moment = require('moment');

// Configuration
const config = {
  // Trendlyne API settings
  trendlyne: {
    url: 'https://trendlyne.com/equity/api/market-insight/',
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
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'x-requested-with': 'XMLHttpRequest',
      'priority': 'u=1, i',
      'Cookie': 'csrftoken=aAt0N01rYVsl4xRBolCBVb0c9Rz6i3KeCyz5FFEPcE3xMV93WJ2h77BKJ7ZUlkHy; *gcl*au=1.1.741971057.1747473324; *ga=GA1.1.1930619395.1747473324; *ga_7F29Q8ZGH0=GS2.1.s1747473324$o1$g1$t1747473386$j60$l0$h0$dTYOdHQ6jNAApfv3iZDyShLbFQRjXE2ajzg'
    },
    getParams: function() {
        // Get today and yesterday using moment.js
        const today = moment();
        const yesterday = moment().subtract(1, 'days');
        
        return {
          startDate: yesterday.format('DD-MM-YYYY'),
          endDate: today.format('DD-MM-YYYY'),
          stockGroup: 'All'
        };
      }
  },

  
  
  // Telegram configuration
  telegram: {
    botToken: '8069228318:AAH8JcGbvwkq7GSqHs3ZzkW1VCxWkpnN4JA',
    channelId: '@GoStockLive' // Replace with your channel ID (e.g., @channelname or -1001234567890)
  }
};

/**
 * Formats market insight data into a readable message for Telegram
 * @param {Array} insights - The market insights from Trendlyne API
 * @return {string} Formatted message for Telegram
 */
function formatDataForTelegram(insights) {
  if (!insights || !insights.length) {
    return 'No market insights available for the selected period.';
  }

  // Start with a header
  let message = '📊 *MARKET INSIGHTS* 📊\n\n';
  
  // Process only the first 10 insights to avoid message length limits
  const insightsToShow = insights.slice(0, 10);
  
  insightsToShow.forEach((insight, index) => {
    message += `*${index + 1}. ${insight.stockName} (${insight.stockCode})*\n`;
    message += `${insight.notification}\n`;
    
    if (insight.label) {
      message += `Label: ${insight.label}\n`;
    }
    
    if (insight.timeStamp) {
      message += `Time: ${insight.timeStamp}\n`;
    }
    
    message += '\n';
  });
  
  // Add footer with link to more insights
  message += 'View more insights at [Trendlyne](https://trendlyne.com/markets-today/)';
  
  return message;
}

/**
 * Fetches data from Trendlyne API
 * @return {Promise<Object>} The API response data
 */
async function fetchTrendlyneData() {
  try {
    console.log('Making request to:', config.trendlyne.url);
    
    const response = await axios.get(config.trendlyne.url, {
      headers: config.trendlyne.headers,
      params: config.trendlyne.getParams()
    });
    
    if (response.status === 200) {
      console.log('✅ API request successful!');
      
      const data = response.data;
      if (data && data.head && data.head.status === "0" && data.body) {
        console.log('✅ Valid response format received');
        
        // Extract and log curtail message if present
        if (data.body.curtailMessage) {
          console.log('ℹ️ API Message:', data.body.curtailMessage);
        }
        
        // Check if we have market insights
        const insights = data.body.marketInsights;
        if (insights && Array.isArray(insights)) {
          console.log(`✅ Retrieved ${insights.length} market insights`);
          
          // Log a sample of the first few insights
          console.log('\n📊 SAMPLE INSIGHTS:');
          insights.slice(0, 3).forEach((insight, index) => {
            console.log(`\n[${index + 1}] ${insight.stockCode} - ${insight.stockName}`);
            console.log(`${insight.notification}`);
            console.log(`Label: ${insight.label} | Time: ${insight.timeStamp}`);
          });
          
          return data.body.marketInsights;
        } else {
          console.log('⚠️ No market insights found in the response');
          return [];
        }
      } else {
        console.log('⚠️ Unexpected response format:', JSON.stringify(data, null, 2).substring(0, 500));
        return [];
      }
    } else {
      console.error('❌ API request failed with status:', response.status);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching data from Trendlyne:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2).substring(0, 500));
    } else if (error.request) {
      console.error('No response received');
    }
    
    return [];
  }
}

/**
 * Sends a message to the configured Telegram channel
 * @param {string} message - The message to send
 * @return {Promise<Object>} The Telegram API response
 */
async function sendToTelegram(message) {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
    
    const response = await axios.post(telegramApiUrl, {
      chat_id: config.telegram.channelId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending message to Telegram:', error.message);
    if (error.response) {
      console.error('Telegram API response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Fetching data from Trendlyne...');
    const insights = await fetchTrendlyneData();
    
    if (!insights || insights.length === 0) {
      console.log('❌ No market insights data available.');
      return;
    }
    
    console.log(`\n✅ Successfully retrieved ${insights.length} market insights.`);
    
    // Format message for Telegram
    const formattedMessage = formatDataForTelegram(insights);
    console.log('\n✅ Formatted message for Telegram.');
    
    // Only try to send to Telegram if bot token and channel are configured
    if (config.telegram.botToken === 'YOUR_BOT_TOKEN' || config.telegram.channelId === 'YOUR_CHANNEL_ID') {
      console.log('\n⚠️ Skipping Telegram send: Please configure your bot token and channel ID first.');
      console.log('To send to Telegram, update the config with your token and channel ID.');
    } else {
      // Send to Telegram
      console.log('\nSending to Telegram channel...');
      try {
        const telegramResponse = await sendToTelegram(formattedMessage);
        console.log('✅ Successfully sent to Telegram!', telegramResponse.ok ? 'Message delivered.' : 'Delivery issue.');
      } catch (telegramError) {
        console.error('❌ Failed to send to Telegram:', telegramError.message);
      }
    }
    
    console.log('\n✅ Script execution completed.');
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

// Execute the script
main();
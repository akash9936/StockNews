const axios = require('axios');
const config = require('../config/config');

class TelegramService {
  constructor() {
    this.botToken = config.telegram.botToken;
    this.channelId = config.telegram.channelId;
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
  }

  /**
   * Formats market insight data into a readable message for Telegram
   * @param {Array} insights - The market insights from API
   * @return {string} Formatted message for Telegram
   */
  formatMessage(insights) {
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
   * Sends a message to the configured Telegram channel
   * @param {string|Array} content - The message content or insights to send
   * @return {Promise<Object>} The Telegram API response
   */
  async sendMessage(content) {
    try {
      // If content is an array, format it first
      const message = Array.isArray(content) ? this.formatMessage(content) : content;

      const response = await axios.post(this.apiUrl, {
        chat_id: this.channelId,
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
}

module.exports = new TelegramService(); 
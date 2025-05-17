const BaseService = require('../base/base.service');
const config = require('../../config');
const logger = require('../../utils/logger');
const messages = require('../../constants/messages');

class TelegramService extends BaseService {
  constructor() {
    super({
      headers: {
        'Content-Type': 'application/json'
      }
    });
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
      return messages.TELEGRAM.NO_INSIGHTS;
    }

    let message = messages.TELEGRAM.HEADER;
    const insightsToShow = insights.slice(0, 10);
    
    insightsToShow.forEach((insight, index) => {
      message += messages.TELEGRAM.MESSAGE_TEMPLATE.STOCK
        .replace('{index}', index + 1)
        .replace('{stockName}', insight.stockName)
        .replace('{stockCode}', insight.stockCode);
      
      message += messages.TELEGRAM.MESSAGE_TEMPLATE.NOTIFICATION
        .replace('{notification}', insight.notification);
      
      if (insight.label) {
        message += messages.TELEGRAM.MESSAGE_TEMPLATE.LABEL
          .replace('{label}', insight.label);
      }
      
      if (insight.timeStamp) {
        message += messages.TELEGRAM.MESSAGE_TEMPLATE.TIME
          .replace('{timeStamp}', insight.timeStamp);
      }
      
      message += '\n';
    });
    
    message += messages.TELEGRAM.FOOTER;
    return message;
  }

  /**
   * Sends a message to the configured Telegram channel
   * @param {string|Array} content - The message content or insights to send
   * @return {Promise<Object>} The Telegram API response
   */
  async sendMessage(content) {
    try {
      const message = Array.isArray(content) ? this.formatMessage(content) : content;
      
      logger.info(messages.LOGS.SENDING);
      const response = await this.post(this.apiUrl, {
        chat_id: this.channelId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });

      logger.success(messages.LOGS.SENT);
      return response;
    } catch (error) {
      logger.error(messages.LOGS.FAILED.replace('{error}', error.message), error);
      throw error;
    }
  }
}

module.exports = new TelegramService(); 
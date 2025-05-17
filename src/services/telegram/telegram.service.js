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
    this.MAX_MESSAGE_LENGTH = 4000; // Telegram's limit is 4096, using 4000 to be safe
  }

  /**
   * Splits a message into chunks that fit within Telegram's message length limit
   * @param {string} message - The message to split
   * @param {string} title - The title to prepend to each chunk
   * @return {Array<string>} Array of message chunks
   */
  splitMessageIntoChunks(message, title) {
    const chunks = [];
    const lines = message.split('\n');
    let currentChunk = `*📊 ${title}*\n\n`;
    let currentLength = currentChunk.length;
    
    for (const line of lines) {
      // If adding this line would exceed the limit, start a new chunk
      if (currentLength + line.length + 1 > this.MAX_MESSAGE_LENGTH) {
        logger.debug(`Creating new chunk for ${title}. Current chunk length: ${currentLength}`);
        chunks.push(currentChunk + messages.TELEGRAM.FOOTER);
        currentChunk = `*📊 ${title} (continued)*\n\n`;
        currentLength = currentChunk.length;
      }
      currentChunk += line + '\n';
      currentLength += line.length + 1;
    }
    
    // Add the last chunk if it's not empty
    if (currentChunk.length > 0) {
      chunks.push(currentChunk + messages.TELEGRAM.FOOTER);
    }
    
    logger.debug(`Split message into ${chunks.length} chunks for ${title}`);
    return chunks;
  }

  /**
   * Formats market insight data into a readable message for Telegram
   * @param {Array} insights - The market insights from API
   * @param {string} title - The title for this message
   * @return {Array<string>} Array of formatted message chunks
   */
  formatMessage(insights, title) {
    if (!insights || !insights.length) {
      logger.debug(`No insights to format for ${title}`);
      return null;
    }

    logger.debug(`Formatting ${insights.length} insights for ${title}`);
    let message = `*📊 ${title}*\n\n`;

    // Format insights
    insights.forEach((insight, index) => {
      if (insight.type === 'SCREEN') {
        // Handle screen insights
        const stockName = insight.title.replace(`${insight.screenType}: `, '');
        logger.debug(`Formatting screen insight ${index + 1}: ${stockName}`);
        
        message += `*${index + 1}. ${stockName}*\n`;
        if (insight.description) {
          message += `📊 ${insight.description}\n`;
        }
        if (insight.details) {
          message += `💰 Current Price: ${insight.details.currentPrice}\n`;
          message += `📈 Day Change: ${insight.details.day_changeP}%\n`;
          message += `📊 Volume: ${insight.details.vol_day}\n`;
        }
        if (insight.url) {
          message += `🔗 [View on Trendlyne](${insight.url})\n`;
        }
        message += '\n';
      } else {
        // Handle market insights
        logger.debug(`Formatting market insight ${index + 1}: ${insight.stockName}`);
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
      }
    });

    const chunks = this.splitMessageIntoChunks(message, title);
    logger.debug(`Formatted message for ${title} into ${chunks.length} chunks`);
    return chunks;
  }

  /**
   * Sends a message to the configured Telegram channel
   * @param {string|Array} content - The message content or insights to send
   * @param {string} title - The title for this message
   * @return {Promise<Array<Object>>} Array of Telegram API responses
   */
  async sendMessage(content, title) {
    try {
      if (Array.isArray(content)) {
        const messageChunks = this.formatMessage(content, title);
        if (!messageChunks || messageChunks.length === 0) {
          logger.info(`No insights to send for ${title}`);
          return null;
        }
        
        logger.info(`Sending ${messageChunks.length} message chunks for ${title}`);
        const responses = [];
        
        for (let i = 0; i < messageChunks.length; i++) {
          const chunk = messageChunks[i];
          logger.debug(`Sending chunk ${i + 1}/${messageChunks.length} for ${title} (length: ${chunk.length})`);
          
          const response = await this.post(this.apiUrl, {
            chat_id: this.channelId,
            text: chunk,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
          });
          
          responses.push(response);
          // Wait for 1 second before sending next chunk to avoid rate limiting
          if (i < messageChunks.length - 1) {
            logger.debug(`Waiting 1 second before sending next chunk for ${title}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        logger.success(`All ${messageChunks.length} message chunks sent for ${title}`);
        return responses;
      } else {
        // Handle plain text messages
        const messageChunks = this.splitMessageIntoChunks(content, title);
        logger.info(`Sending ${messageChunks.length} message chunks for plain text`);
        
        const responses = [];
        for (let i = 0; i < messageChunks.length; i++) {
          const chunk = messageChunks[i];
          logger.debug(`Sending plain text chunk ${i + 1}/${messageChunks.length} (length: ${chunk.length})`);
          
          const response = await this.post(this.apiUrl, {
            chat_id: this.channelId,
            text: chunk,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
          });
          
          responses.push(response);
          // Wait for 1 second before sending next chunk to avoid rate limiting
          if (i < messageChunks.length - 1) {
            logger.debug(`Waiting 1 second before sending next plain text chunk`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        logger.success(`All ${messageChunks.length} plain text chunks sent`);
        return responses;
      }
    } catch (error) {
      logger.error(`Failed to send message for ${title}: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = new TelegramService(); 
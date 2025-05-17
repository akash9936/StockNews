const moment = require('moment');
const BaseService = require('../base/base.service');
const config = require('../../config');
const logger = require('../../utils/logger');
const messages = require('../../constants/messages');

class TrendlyneService extends BaseService {
  constructor() {
    super({
      headers: config.trendlyne.headers
    });
    this.url = config.trendlyne.url;
  }

  /**
   * Gets the parameters for the API request
   * @return {Object} The request parameters
   */
  getParams() {
    const today = moment();
    const yesterday = moment().subtract(1, 'days');
    
    return {
      startDate: yesterday.format('DD-MM-YYYY'),
      endDate: today.format('DD-MM-YYYY'),
      stockGroup: 'All'
    };
  }

  /**
   * Fetches data from Trendlyne API
   * @return {Promise<Array>} The market insights data
   */
  async fetchMarketInsights() {
    try {
      logger.info(messages.LOGS.FETCHING);
      
      const data = await this.get(this.url, this.getParams());
      
      if (data && data.head && data.head.status === "0" && data.body) {
        logger.success('API request successful');
        
        if (data.body.curtailMessage) {
          logger.warn(data.body.curtailMessage);
        }
        
        const insights = data.body.marketInsights;
        if (insights && Array.isArray(insights)) {
          logger.success(messages.LOGS.RETRIEVED.replace('{count}', insights.length));
          
          // Log sample insights
          logger.debug('Sample Insights:', insights.slice(0, 3));
          
          return insights;
        }
      }
      
      logger.warn(messages.LOGS.NO_DATA);
      return [];
      
    } catch (error) {
      logger.error('Error fetching market insights', error);
      return [];
    }
  }
}

module.exports = new TrendlyneService(); 
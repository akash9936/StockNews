const moment = require('moment');
const BaseService = require('../base/base.service');
const config = require('../../config');
const logger = require('../../utils/logger');
const messages = require('../../constants/messages');

class TrendlyneService extends BaseService {
  constructor() {
    super({
      headers: config.marketInsights.requestConfig.headers
    });
    this.marketInsightsUrl = config.marketInsights.marketInsights.url;
    this.screenerUrl = config.marketInsights.baseUrl;
  }

  /**
   * Gets the parameters for the market insights API request
   * @return {Object} The request parameters
   */
  getMarketInsightParams() {
    const today = moment();
    const yesterday = moment().subtract(1, 'days');
    
    return {
      startDate: yesterday.format('DD-MM-YYYY'),
      endDate: today.format('DD-MM-YYYY'),
      stockGroup: 'All'
    };
  }

  /**
   * Gets the URL for a specific screen
   * @param {string} screenId - The screen ID
   * @return {string} The complete URL
   */
  getScreenUrl(screenId) {
    return `${this.screenerUrl}/${screenId}/5/0/index/NIFTY500/`;
  }

  /**
   * Fetches data from Trendlyne Market Insights API
   * @return {Promise<Array>} The market insights data
   */
  async fetchMarketInsights() {
    if (!config.marketInsights.marketInsights.enabled) {
      logger.info('Market insights are disabled in configuration');
      return [];
    }

    try {
      logger.info(messages.LOGS.FETCHING);
      
      const data = await this.get(this.marketInsightsUrl, this.getMarketInsightParams());
      
      if (data && data.head && data.head.status === "0" && data.body) {
        logger.success('API request successful');
        
        if (data.body.curtailMessage) {
          logger.warn(data.body.curtailMessage);
        }
        
        const insights = data.body.marketInsights;
        if (insights && Array.isArray(insights)) {
          logger.success(messages.LOGS.RETRIEVED.replace('{count}', insights.length));
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

  /**
   * Fetches data from a specific Trendlyne Screen
   * @param {Object} screen - The screen configuration
   * @return {Promise<Array>} The screen insights data
   */
  async fetchScreenInsights(screen) {
    if (!screen.enabled) {
      logger.info(`Screen ${screen.title} is disabled in configuration`);
      return [];
    }

    try {
      logger.info(`Fetching insights for screen: ${screen.title}`);
      
      const data = await this.get(this.getScreenUrl(screen.id), {}, {
        headers: config.marketInsights.requestConfig.headers
      });
      
      if (data && data.screenData && Array.isArray(data.screenData)) {
        logger.success(`Successfully retrieved ${data.screenData.length} insights for ${screen.title}`);
        
        // Transform the data to match the market insights format
        const insights = data.screenData.map(item => ({
          title: `${screen.title}: ${item.name}`,
          description: `${item.name} - ${item.value}%`,
          url: `https://trendlyne.com${item.stockurl}`,
          timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
          type: 'SCREEN',
          screenType: screen.title,
          details: item.tooltipParams.reduce((acc, param) => {
            acc[param.key] = param.value;
            return acc;
          }, {})
        }));

        return insights;
      }
      
      logger.warn(`No data found for screen: ${screen.title}`);
      return [];
      
    } catch (error) {
      logger.error(`Error fetching insights for screen ${screen.title}:`, error);
      return [];
    }
  }

  /**
   * Fetches insights from all enabled screens
   * @return {Promise<Array>} Combined insights from all screens
   */
  async fetchAllScreenInsights() {
    const enabledScreens = config.marketInsights.screens.filter(screen => screen.enabled);
    const allInsights = [];

    for (const screen of enabledScreens) {
      const insights = await this.fetchScreenInsights(screen);
      allInsights.push(...insights);
    }

    return allInsights;
  }

  /**
   * Fetches all insights (both market insights and screen insights)
   * @return {Promise<Array>} Combined insights from all sources
   */
  async fetchAllInsights() {
    const [marketInsights, screenInsights] = await Promise.all([
      this.fetchMarketInsights()
      //,this.fetchAllScreenInsights()  screen disable from hear
    ]);

    return [
      ...(marketInsights || []),
      ...(screenInsights || [])
    ];
  }
}

module.exports = new TrendlyneService(); 
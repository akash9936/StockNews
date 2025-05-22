const logger = require('./logger');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment-timezone');

class InsightTracker {
  constructor() {
    this.lastInsights = new Map(); // Map to store last sent insights
    this.storageFile = path.join(__dirname, '../../data/insight-tracker.json');
    this.initialized = true; // No need for initialization since we're not persisting state
    this.timezone = 'Asia/Kolkata'; // IST timezone
  }

  /**
   * Initialize the tracker by loading persisted data
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(path.dirname(this.storageFile), { recursive: true });
      
      // Try to load existing data
      try {
        const data = await fs.readFile(this.storageFile, 'utf8');
        const savedInsights = JSON.parse(data);
        this.lastInsights = new Map(Object.entries(savedInsights));
        logger.info(`Loaded ${this.lastInsights.size} tracked insights from storage`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          logger.info('No existing insight tracker data found, starting fresh');
        } else {
          logger.error('Error loading insight tracker data:', error);
        }
      }
      
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize insight tracker:', error);
      throw error;
    }
  }

  /**
   * Save the current state to disk
   */
  async persistData() {
    try {
      const data = Object.fromEntries(this.lastInsights);
      await fs.writeFile(this.storageFile, JSON.stringify(data, null, 2));
      logger.debug(`Persisted ${this.lastInsights.size} insights to storage`);
    } catch (error) {
      logger.error('Failed to persist insight tracker data:', error);
    }
  }

  /**
   * Get a unique key for an insight based on its type
   * @param {Object} insight - The insight object
   * @returns {string} A unique key for the insight
   */
  getInsightKey(insight) {
    if (insight.type === 'SCREEN') {
      // For screen insights, use screenType and title as key
      return `SCREEN_${insight.screenType}_${insight.title}`;
    } else {
      // For market insights, use stockCode and timeStamp as key
      return `MARKET_${insight.stockCode}_${insight.timeStamp}`;
    }
  }

  /**
   * Compare new insights with previously sent ones and filter by time
   * @param {Array} newInsights - Array of new insights
   * @returns {Promise<Array>} Array of insights from the last 2 hours in IST
   */
  async getNewInsights(newInsights) {
    if (!newInsights || !Array.isArray(newInsights)) {
      return [];
    }

    // Calculate the timestamp for 2 hours ago in IST
    const twoHoursAgo = moment().tz(this.timezone).subtract(2, 'hours');
    logger.debug(`Filtering insights after: ${twoHoursAgo.format('YYYY-MM-DD HH:mm:ss')} IST`);

    // Filter insights from the last 2 hours
    const recentInsights = newInsights.filter(insight => {
      // Parse the insight timestamp in IST
      const insightTime = moment.tz(insight.timeStamp, 'YYYY-MM-DD HH:mm:ss', this.timezone);
      
      if (!insightTime.isValid()) {
        logger.warn(`Invalid timestamp for insight: ${this.getInsightKey(insight)}, timestamp: ${insight.timeStamp}`);
        return false;
      }

      const isRecent = insightTime.isAfter(twoHoursAgo);
      
      if (isRecent) {
        logger.debug(`Recent insight found: ${this.getInsightKey(insight)} at ${insightTime.format('YYYY-MM-DD HH:mm:ss')} IST`);
      } else {
        logger.debug(`Skipping old insight: ${this.getInsightKey(insight)} at ${insightTime.format('YYYY-MM-DD HH:mm:ss')} IST`);
      }
      
      return isRecent;
    });

    // Log counts by type
    const marketInsightsCount = recentInsights.filter(i => !i.type || i.type !== 'SCREEN').length;
    const screenInsightsCount = recentInsights.filter(i => i.type === 'SCREEN').length;
    logger.info(`Recent insights (last 2 hours in IST) - Market: ${marketInsightsCount}, Screen: ${screenInsightsCount}`);

    return recentInsights;
  }

  /**
   * Get count of recent insights
   * @param {Array} insights - Array of insights
   * @returns {Promise<number>} Count of recent insights
   */
  async getNewInsightsCount(insights) {
    const recentInsights = await this.getNewInsights(insights);
    return recentInsights.length;
  }

  /**
   * Clear all tracked insights
   */
  async clearInsights() {
    this.lastInsights.clear();
    await this.persistData();
    logger.info('Cleared all tracked insights');
  }
}

module.exports = new InsightTracker(); 
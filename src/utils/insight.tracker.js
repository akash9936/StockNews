const logger = require('./logger');
const fs = require('fs').promises;
const path = require('path');

class InsightTracker {
  constructor() {
    this.lastInsights = new Map(); // Map to store last sent insights
    this.storageFile = path.join(__dirname, '../../data/insight-tracker.json');
    this.initialized = false;
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
   * Compare new insights with previously sent ones
   * @param {Array} newInsights - Array of new insights
   * @returns {Promise<Array>} Array of new insights that haven't been sent before
   */
  async getNewInsights(newInsights) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!newInsights || !Array.isArray(newInsights)) {
      return [];
    }

    const uniqueNewInsights = newInsights.filter(insight => {
      const key = this.getInsightKey(insight);
      if (!this.lastInsights.has(key)) {
        this.lastInsights.set(key, insight);
        logger.debug(`New insight found: ${key}`);
        return true;
      }
      logger.debug(`Duplicate insight found: ${key}`);
      return false;
    });

    // Log counts by type
    const marketInsightsCount = uniqueNewInsights.filter(i => !i.type || i.type !== 'SCREEN').length;
    const screenInsightsCount = uniqueNewInsights.filter(i => i.type === 'SCREEN').length;
    logger.debug(`New insights by type - Market: ${marketInsightsCount}, Screen: ${screenInsightsCount}`);

    // Clean up old insights (keep only last 1000 entries to prevent memory issues)
    if (this.lastInsights.size > 1000) {
      const keysToDelete = Array.from(this.lastInsights.keys()).slice(0, this.lastInsights.size - 1000);
      keysToDelete.forEach(key => this.lastInsights.delete(key));
      logger.debug(`Cleaned up ${keysToDelete.length} old insights`);
    }

    // Persist the updated data
    if (uniqueNewInsights.length > 0) {
      await this.persistData();
    }

    return uniqueNewInsights;
  }

  /**
   * Get count of new insights
   * @param {Array} newInsights - Array of new insights
   * @returns {Promise<number>} Count of new insights
   */
  async getNewInsightsCount(insights) {
    const uniqueInsights = await this.getNewInsights(insights);
    return uniqueInsights.length;
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
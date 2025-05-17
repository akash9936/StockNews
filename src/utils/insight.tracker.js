const logger = require('./logger');

class InsightTracker {
  constructor() {
    this.lastInsights = new Map(); // Map to store last sent insights
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
   * @returns {Array} Array of new insights that haven't been sent before
   */
  getNewInsights(newInsights) {
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

    return uniqueNewInsights;
  }

  /**
   * Get count of new insights
   * @param {Array} newInsights - Array of new insights
   * @returns {number} Count of new insights
   */
  getNewInsightsCount(newInsights) {
    return this.getNewInsights(newInsights).length;
  }

  /**
   * Clear all tracked insights
   */
  clearInsights() {
    this.lastInsights.clear();
    logger.info('Cleared all tracked insights');
  }
}

module.exports = new InsightTracker(); 
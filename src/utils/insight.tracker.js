const logger = require('./logger');

class InsightTracker {
  constructor() {
    this.lastInsights = new Map(); // Map to store last sent insights by stock code
  }

  /**
   * Compare new insights with previously sent ones
   * @param {Array} newInsights - Array of new market insights
   * @returns {Array} Array of new insights that haven't been sent before
   */
  getNewInsights(newInsights) {
    if (!newInsights || !Array.isArray(newInsights)) {
      return [];
    }

    const uniqueNewInsights = newInsights.filter(insight => {
      const key = `${insight.stockCode}_${insight.timeStamp}`;
      if (!this.lastInsights.has(key)) {
        this.lastInsights.set(key, insight);
        return true;
      }
      return false;
    });

    // Clean up old insights (keep only last 1000 entries to prevent memory issues)
    if (this.lastInsights.size > 1000) {
      const keysToDelete = Array.from(this.lastInsights.keys()).slice(0, this.lastInsights.size - 1000);
      keysToDelete.forEach(key => this.lastInsights.delete(key));
    }

    return uniqueNewInsights;
  }

  /**
   * Get count of new insights
   * @param {Array} newInsights - Array of new market insights
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
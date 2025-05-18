const config = require('../config');

class Logger {
  constructor() {
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.currentLevel = this.logLevels[config.app.logLevel] || this.logLevels.info;
  }

  /**
   * Get formatted timestamp
   * @returns {string} Formatted timestamp
   */
  getTimestamp() {
    const now = new Date();
    return now.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  /**
   * Format log message with timestamp
   * @param {string} message - The message to format
   * @returns {string} Formatted message with timestamp
   */
  formatMessage(message) {
    return `[${this.getTimestamp()}] ${message}`;
  }

  /**
   * Logs an error message
   * @param {string} message - The message to log
   * @param {Error} [error] - Optional error object
   */
  error(message, error = null) {
    if (this.currentLevel >= this.logLevels.error) {
      console.error(this.formatMessage(`❌ ${message}`));
      if (error) {
        console.error(error);
      }
    }
  }

  /**
   * Logs a warning message
   * @param {string} message - The message to log
   */
  warn(message) {
    if (this.currentLevel >= this.logLevels.warn) {
      console.warn(this.formatMessage(`⚠️ ${message}`));
    }
  }

  /**
   * Logs an info message
   * @param {string} message - The message to log
   */
  info(message) {
    if (this.currentLevel >= this.logLevels.info) {
      console.info(this.formatMessage(`ℹ️ ${message}`));
    }
  }

  /**
   * Logs a debug message
   * @param {string} message - The message to log
   * @param {Object} [data] - Optional data to log
   */
  debug(message, data = null) {
    if (this.currentLevel >= this.logLevels.debug) {
      console.debug(this.formatMessage(`🔍 ${message}`));
      if (data) {
        console.debug(data);
      }
    }
  }

  /**
   * Logs a success message
   * @param {string} message - The message to log
   */
  success(message) {
    if (this.currentLevel >= this.logLevels.info) {
      console.info(this.formatMessage(`✅ ${message}`));
    }
  }
}

module.exports = new Logger(); 
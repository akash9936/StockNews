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
   * Logs an error message
   * @param {string} message - The message to log
   * @param {Error} [error] - Optional error object
   */
  error(message, error = null) {
    if (this.currentLevel >= this.logLevels.error) {
      console.error(`❌ ${message}`);
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
      console.warn(`⚠️ ${message}`);
    }
  }

  /**
   * Logs an info message
   * @param {string} message - The message to log
   */
  info(message) {
    if (this.currentLevel >= this.logLevels.info) {
      console.info(`ℹ️ ${message}`);
    }
  }

  /**
   * Logs a debug message
   * @param {string} message - The message to log
   * @param {Object} [data] - Optional data to log
   */
  debug(message, data = null) {
    if (this.currentLevel >= this.logLevels.debug) {
      console.debug(`🔍 ${message}`);
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
      console.info(`✅ ${message}`);
    }
  }
}

module.exports = new Logger(); 
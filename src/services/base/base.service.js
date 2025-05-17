const axios = require('axios');

class BaseService {
  constructor(config) {
    this.config = config;
    this.axios = axios.create({
      timeout: 30000, // 30 seconds timeout
      headers: config.headers || {}
    });
  }

  /**
   * Makes an HTTP GET request
   * @param {string} url - The URL to request
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} The response data
   */
  async get(url, params = {}) {
    try {
      const response = await this.axios.get(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Makes an HTTP POST request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @returns {Promise<Object>} The response data
   */
  async post(url, data = {}) {
    try {
      const response = await this.axios.post(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handles API errors
   * @param {Error} error - The error object
   */
  handleError(error) {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

module.exports = BaseService; 
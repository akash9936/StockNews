require('dotenv').config();

const appConfig = require('./app.config');
const telegramConfig = require('./telegram.config');
const apiConfig = require('./api.config');

module.exports = {
  app: appConfig,
  telegram: telegramConfig,
  trendlyne: apiConfig.trendlyne
}; 
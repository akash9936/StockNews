require('dotenv').config();

const appConfig = require('./app.config');
const telegramConfig = require('./telegram.config');
const apiConfig = require('./api.config');
const marketInsightsConfig = require('./market-insights.config');

module.exports = {
  app: appConfig,
  telegram: telegramConfig,
  trendlyne: apiConfig.trendlyne,
  marketInsights: marketInsightsConfig
}; 
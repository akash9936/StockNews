const trendlyneService = require('./services/trendlyne/trendlyne.service');
const telegramService = require('./services/telegram/telegram.service');
const schedulerService = require('./services/scheduler/scheduler.service');
const insightTracker = require('./utils/insight.tracker');
const config = require('./config');
const logger = require('./utils/logger');
const messages = require('./constants/messages');

/**
 * Main task to fetch and send market insights
 */
async function fetchAndSendInsights() {
  try {
    // Fetch data from Trendlyne
    const allInsights = await trendlyneService.fetchMarketInsights();
    
    if (!allInsights || allInsights.length === 0) {
      logger.warn(messages.LOGS.NO_DATA);
      return;
    }

    // Get only new insights
    const newInsights = insightTracker.getNewInsights(allInsights);
    const newInsightsCount = newInsights.length;

    if (newInsightsCount === 0) {
      logger.info(`No new insights to send. Total insights available: ${allInsights.length}`);
      return;
    }

    logger.info(`Found ${newInsightsCount} new insights out of ${allInsights.length} total insights`);
    
    // Send only new insights to Telegram
    await telegramService.sendMessage(newInsights);
    logger.info(`Successfully sent ${newInsightsCount} new insights to Telegram`);
    
  } catch (error) {
    logger.error(messages.LOGS.FAILED.replace('{error}', error.message), error);
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    logger.info(messages.LOGS.STARTING);
    logger.info(messages.LOGS.ENV_INFO.replace('{env}', config.app.env));
    
    // Start the scheduler
    schedulerService.start(fetchAndSendInsights, 'market-insights');
    
    // Handle process termination
    process.on('SIGINT', () => {
      logger.info('Received SIGINT. Stopping scheduler...');
      schedulerService.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM. Stopping scheduler...');
      schedulerService.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error(messages.LOGS.FAILED.replace('{error}', error.message), error);
    process.exit(1);
  }
}

// Execute the script
main(); 
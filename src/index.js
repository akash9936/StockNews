const trendlyneService = require('./services/trendlyne/trendlyne.service');
const telegramService = require('./services/telegram/telegram.service');
const schedulerService = require('./services/scheduler/scheduler.service');
const config = require('./config');
const logger = require('./utils/logger');
const messages = require('./constants/messages');

/**
 * Main task to fetch and send market insights
 */
async function fetchAndSendInsights() {
  try {
    // Fetch data from Trendlyne
    const insights = await trendlyneService.fetchMarketInsights();
    
    if (!insights || insights.length === 0) {
      logger.warn(messages.LOGS.NO_DATA);
      return;
    }
    
    // Send to Telegram
    await telegramService.sendMessage(insights);
    
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
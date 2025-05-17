const trendlyneService = require('./services/trendlyne/trendlyne.service');
const telegramService = require('./services/telegram/telegram.service');
const schedulerService = require('./services/scheduler/scheduler.service');
const insightTracker = require('./utils/insight.tracker');
const config = require('./config');
const logger = require('./utils/logger');
const messages = require('./constants/messages');

/**
 * Task to fetch and send all insights
 */
async function fetchAndSendAllInsights() {
  try {
    // Fetch all insights using the unified method
    const allInsights = await trendlyneService.fetchAllInsights();

    if (allInsights.length === 0) {
      logger.warn('No insights data available');
      return;
    }

    // Get only new insights
    const newInsights = insightTracker.getNewInsights(allInsights);
    const newInsightsCount = newInsights.length;

    if (newInsightsCount === 0) {
      logger.info(`No new insights to send. Total insights available: ${allInsights.length}`);
      return;
    }

    // Separate market insights and screen insights
    const marketInsights = newInsights.filter(i => !i.type || i.type !== 'SCREEN');
    const screenInsights = newInsights.filter(i => i.type === 'SCREEN');

    // Log counts by type
    const marketInsightsCount = marketInsights.length;
    const screenInsightsCount = screenInsights.length;

    logger.info(`Found ${newInsightsCount} new insights out of ${allInsights.length} total insights`);
    logger.info(`- Market insights: ${marketInsightsCount}`);
    logger.info(`- Screen insights: ${screenInsightsCount}`);
    
    // Send market insights if any
    if (marketInsights.length > 0) {
      logger.info(`Processing ${marketInsights.length} market insights`);
      await telegramService.sendMessage(marketInsights, 'MARKET INSIGHTS');
      logger.info(`Successfully sent ${marketInsights.length} market insights to Telegram`);
    }

    // Group screen insights by screen type and send separately
    const groupedScreenInsights = screenInsights.reduce((acc, insight) => {
      if (!acc[insight.screenType]) {
        acc[insight.screenType] = [];
      }
      acc[insight.screenType].push(insight);
      return acc;
    }, {});

    // Log the grouped insights
    logger.info('Screen insights grouped by type:');
    Object.entries(groupedScreenInsights).forEach(([screenType, insights]) => {
      logger.info(`- ${screenType}: ${insights.length} insights`);
    });

    // Send each screen type's insights separately
    for (const [screenType, insights] of Object.entries(groupedScreenInsights)) {
      const screenConfig = config.marketInsights.screens.find(s => s.title === screenType);
      const title = screenConfig ? screenConfig.title : screenType;
      
      logger.info(`Processing ${insights.length} insights for ${title}`);
      try {
        await telegramService.sendMessage(insights, title);
        logger.info(`Successfully sent ${insights.length} insights for ${title} to Telegram`);
        // Add a small delay between different screen types
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logger.error(`Failed to send insights for ${title}: ${error.message}`);
        // Continue with next screen even if one fails
        continue;
      }
    }
    
    logger.success('Completed processing all insights');
  } catch (error) {
    logger.error(`Error in insights task: ${error.message}`, error);
  }
}

async function fetchAndSendInsights() {
  try {
    // Fetch market insights
    const marketInsights = await trendlyneService.fetchMarketInsights();
    if (marketInsights && marketInsights.length > 0) {
      await telegramService.sendMessage(marketInsights, 'MARKET INSIGHTS');
    }

    // Fetch screen insights for each enabled screen
    const enabledScreens = config.marketInsights.screens.filter(screen => screen.enabled);
    for (const screen of enabledScreens) {
      const screenInsights = await trendlyneService.fetchScreenInsights(screen.id);
      if (screenInsights && screenInsights.length > 0) {
        await telegramService.sendMessage(screenInsights, screen.title);
      }
    }

    logger.success(`Successfully processed all insights`);
  } catch (error) {
    logger.error(`Error in fetchAndSendInsights: ${error.message}`, error);
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    logger.info(messages.LOGS.STARTING);
    logger.info(messages.LOGS.ENV_INFO.replace('{env}', config.app.env));
    
    // Start the scheduler for all insights
    const schedule = config.marketInsights.marketInsights.cron.schedule;
    const timezone = config.marketInsights.marketInsights.cron.timezone;
    
    schedulerService.start(fetchAndSendAllInsights, 'market-insights', schedule, timezone);
    
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
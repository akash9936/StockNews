module.exports = {
  TELEGRAM: {
    HEADER: '📊 *MARKET INSIGHTS* 📊\n\n',
    FOOTER: 'View more insights at [Trendlyne](https://trendlyne.com/markets-today/)',
    NO_INSIGHTS: 'No market insights available for the selected period.',
    MESSAGE_TEMPLATE: {
      STOCK: '*{index}. {stockName} ({stockCode})*\n',
      NOTIFICATION: '{notification}\n',
      LABEL: 'Label: {label}\n',
      TIME: 'Time: {timeStamp}\n'
    }
  },
  
  LOGS: {
    STARTING: 'Starting Trendlyne Market Insights Service...',
    ENV_INFO: 'Running in {env} environment',
    FETCHING: 'Fetching data from Trendlyne...',
    NO_DATA: 'No market insights data available',
    RETRIEVED: 'Successfully retrieved {count} market insights.',
    SENDING: 'Sending to Telegram channel...',
    SENT: 'Successfully sent to Telegram!',
    DELIVERY_ISSUE: 'Delivery issue.',
    COMPLETED: 'Script execution completed.',
    FAILED: 'Operation failed: {error}',
    NEW_INSIGHTS: 'Found {count} new insights out of {total} total insights',
    NO_NEW_INSIGHTS: 'No new insights to send. Total insights available: {total}',
    SENT_INSIGHTS: 'Successfully sent {count} new insights to Telegram'
  }
}; 
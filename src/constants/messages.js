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
    STARTING: 'Starting market insights service...',
    ENV_INFO: 'Environment: {env}',
    FETCHING: 'Fetching data from Trendlyne...',
    NO_DATA: 'No market insights data available.',
    RETRIEVED: 'Successfully retrieved {count} market insights.',
    SENDING: 'Sending to Telegram channel...',
    SENT: 'Successfully sent to Telegram!',
    DELIVERY_ISSUE: 'Delivery issue.',
    COMPLETED: 'Script execution completed.',
    FAILED: 'Script execution failed: {error}'
  }
}; 
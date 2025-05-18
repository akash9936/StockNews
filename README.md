# Trendlyne Market Insights Service

A Node.js service that fetches market insights from Trendlyne and sends them to a Telegram channel.

## branch
dev: cron run with local and stop duplicate data
devV1: Run process and exit the code
devV2: Run cron without blocking history send message to telegram every time
from dev -> devubu: Deploy in ubuntu machine


## Features

- Fetches market insights from Trendlyne API
- Formats insights into readable messages
- Sends updates to a Telegram channel
- Configurable through environment variables
- Modular and extensible architecture
- Centralized logging and error handling
- Base service class for common functionality
- Message templates and constants
- Configurable cron scheduling

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Telegram bot token
- A Telegram channel ID

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trendlyne-scrap
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=your_channel_id_here

# Trendlyne API Configuration
TRENDLYNE_API_URL=https://trendlyne.com/equity/api/market-insight/
TRENDLYNE_USER_AGENT=your_user_agent_here

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info

# Cron Configuration
CRON_ENABLED=true
CRON_INTERVAL_MINUTES=1
CRON_TIMEZONE=Asia/Kolkata
```

## Usage

Run the service:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Cron Configuration

The service runs on a configurable schedule using node-cron. You can configure the following settings in your `.env` file:

- `CRON_ENABLED`: Set to 'true' or 'false' to enable/disable the scheduler (default: true)
- `CRON_INTERVAL_MINUTES`: Set the interval in minutes between each fetch (default: 1)
- `CRON_TIMEZONE`: Set the timezone for the cron job (default: Asia/Kolkata)

Example cron configurations:
```env
# Run every 5 minutes
CRON_INTERVAL_MINUTES=5

# Run every 15 minutes in US Eastern time
CRON_INTERVAL_MINUTES=15
CRON_TIMEZONE=America/New_York

# Disable cron jobs
CRON_ENABLED=false
```

## Project Structure

```
trendlyneScrap/
├── src/
│   ├── config/
│   │   ├── index.js          # Exports all config
│   │   ├── app.config.js     # App specific config
│   │   ├── telegram.config.js # Telegram specific config
│   │   └── api.config.js     # API endpoints and headers config
│   ├── services/
│   │   ├── base/
│   │   │   └── base.service.js  # Base service class with common methods
│   │   ├── telegram/
│   │   │   ├── index.js         # Exports telegram service
│   │   │   ├── telegram.service.js
│   │   │   └── formatters.js    # Message formatting utilities
│   │   ├── trendlyne/
│   │   │   ├── index.js         # Exports trendlyne service
│   │   │   └── trendlyne.service.js
│   │   └── scheduler/
│   │       └── scheduler.service.js # Cron job scheduler
│   ├── utils/
│   │   ├── logger.js           # Logging utility
│   │   ├── date.utils.js       # Date formatting utilities
│   │   └── error.handler.js    # Error handling utilities
│   ├── constants/
│   │   ├── index.js           # Exports all constants
│   │   ├── messages.js        # Message templates
│   │   └── api.constants.js   # API related constants
│   └── index.js              # Main application entry
├── scripts/
│   └── setup.js              # Setup scripts (if needed)
├── tests/                    # Test directory
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Adding New Data Sources

To add a new data source:

1. Create a new service directory in `src/services/`
2. Create a new service class that extends `BaseService`
3. Implement the data fetching logic
4. Use the Telegram service to send messages
5. Update the main application to include the new service

Example of adding a new service:
```javascript
// src/services/new-source/new-source.service.js
const BaseService = require('../base/base.service');
const config = require('../../config');
const logger = require('../../utils/logger');

class NewSourceService extends BaseService {
  constructor() {
    super({
      headers: config.newSource.headers
    });
    this.url = config.newSource.url;
  }

  async fetchData() {
    // Implement data fetching logic
  }
}

module.exports = new NewSourceService();
```

## Development

### Logging

The application uses a centralized logging system with different log levels:
- error: Critical errors that need immediate attention
- warn: Warning messages for potential issues
- info: General information about the application flow
- debug: Detailed information for debugging

Set the log level in your `.env` file:
```env
LOG_LEVEL=debug  # Options: error, warn, info, debug
```

### Error Handling

The application includes centralized error handling through the base service class. All API calls automatically handle errors and log them appropriately.

## License

ISC 
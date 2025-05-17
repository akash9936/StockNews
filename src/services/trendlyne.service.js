const axios = require('axios');
const moment = require('moment');
const config = require('../config/config');

class TrendlyneService {
  constructor() {
    this.url = config.trendlyne.url;
    this.headers = config.trendlyne.headers;
  }

  /**
   * Gets the parameters for the API request
   * @return {Object} The request parameters
   */
  getParams() {
    const today = moment();
    const yesterday = moment().subtract(1, 'days');
    
    return {
      startDate: yesterday.format('DD-MM-YYYY'),
      endDate: today.format('DD-MM-YYYY'),
      stockGroup: 'All'
    };
  }

  /**
   * Fetches data from Trendlyne API
   * @return {Promise<Array>} The market insights data
   */
  async fetchMarketInsights() {
    try {
      console.log('Making request to:', this.url);
      
      const response = await axios.get(this.url, {
        headers: this.headers,
        params: this.getParams()
      });
      
      if (response.status === 200) {
        console.log('✅ API request successful!');
        
        const data = response.data;
        if (data && data.head && data.head.status === "0" && data.body) {
          console.log('✅ Valid response format received');
          
          // Extract and log curtail message if present
          if (data.body.curtailMessage) {
            console.log('ℹ️ API Message:', data.body.curtailMessage);
          }
          
          // Check if we have market insights
          const insights = data.body.marketInsights;
          if (insights && Array.isArray(insights)) {
            console.log(`✅ Retrieved ${insights.length} market insights`);
            
            // Log a sample of the first few insights
            console.log('\n📊 SAMPLE INSIGHTS:');
            insights.slice(0, 3).forEach((insight, index) => {
              console.log(`\n[${index + 1}] ${insight.stockCode} - ${insight.stockName}`);
              console.log(`${insight.notification}`);
              console.log(`Label: ${insight.label} | Time: ${insight.timeStamp}`);
            });
            
            return insights;
          }
        }
      }
      
      console.log('⚠️ No market insights found in the response');
      return [];
      
    } catch (error) {
      console.error('❌ Error fetching data from Trendlyne:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2).substring(0, 500));
      } else if (error.request) {
        console.error('No response received');
      }
      
      return [];
    }
  }
}

module.exports = new TrendlyneService(); 
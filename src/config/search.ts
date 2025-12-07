/**
 * Search Provider Configuration
 * 
 * Active Provider: Google Custom Search JSON API
 * 
 * Google Custom Search JSON API allows you to search the open web programmatically.
 * It returns structured JSON results that can be integrated into applications.
 * 
 * Required Environment Variables:
 * - GOOGLE_CSE_API_KEY: Your Google Cloud API key with Custom Search API enabled
 * - GOOGLE_CSE_CX: Your Custom Search Engine ID (also called "cx" parameter)
 * 
 * Setup Instructions:
 * 1. Go to https://console.cloud.google.com/
 * 2. Enable the Custom Search API
 * 3. Create an API key (or use existing one)
 * 4. Go to https://programmablesearchengine.google.com/
 * 5. Create a new search engine (select "Search the entire web")
 * 6. Copy the Search Engine ID (cx parameter)
 * 7. Add both values to your .env file
 * 
 * API Documentation:
 * https://developers.google.com/custom-search/v1/overview
 * 
 * Rate Limits:
 * - Free tier: 100 queries per day
 * - Paid tier: Up to 10,000 queries per day (requires billing)
 */

export const SEARCH_CONFIG = {
  provider: 'Google Custom Search JSON API',
  requiredEnvVars: ['GOOGLE_CSE_API_KEY', 'GOOGLE_CSE_CX'],
  apiEndpoint: 'https://www.googleapis.com/customsearch/v1',
  documentation: 'https://developers.google.com/custom-search/v1/overview',
} as const;


// Configuration management for production readiness
export const config = {
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API Configuration
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL || '',
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
  },
  
  // Gemini AI Configuration
  gemini: {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
  },
  
  // App Configuration
  app: {
    name: 'Load Your Bags',
    version: '1.0.0',
    baseUrl: process.env.REACT_APP_BASE_URL || 'https://your-app-name.replit.app',
    environment: process.env.REACT_APP_ENV || 'development',
  },
  
  // Feature Flags
  features: {
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    enablePushNotifications: process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === 'true',
    enableOfflineMode: process.env.REACT_APP_ENABLE_OFFLINE_MODE === 'true',
  },
  
  // API Configuration
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // Performance Configuration
  performance: {
    enableServiceWorker: process.env.REACT_APP_ENABLE_SW === 'true',
    enableLazyLoading: true,
    imageOptimization: true,
  }
};

// Validation
if (config.isProduction) {
  if (!config.supabase.url || !config.supabase.anonKey) {
    console.error('Missing Supabase configuration in production');
  }
  
  if (!config.gemini.apiKey) {
    console.warn('Missing Gemini API key - AI features will be disabled');
  }
}

export default config;

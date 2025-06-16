// server/utils/logger.js
const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  },
  
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  },
  
  error: (message, data = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data);
    
    // If data contains a stack trace, log it separately for better readability
    if (data.stack) {
      console.error(`[STACK] ${data.stack}`);
    }
  },
  
  debug: (message, data = {}) => {
    // Only log in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  }
};

module.exports = logger; 
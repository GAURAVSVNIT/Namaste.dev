import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor(name = 'app') {
    this.name = name;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      logger: this.name,
      message,
      ...(data && { data })
    };
    
    return JSON.stringify(logEntry, null, 2);
  }

  writeToFile(level, message, data = null) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(logsDir, `${this.name}-${today}.log`);
      const logEntry = this.formatMessage(level, message, data);
      
      fs.appendFileSync(logFile, logEntry + '\n');
      
      // Also log to console for development
      const consoleMsg = `[${level}] ${this.name}: ${message}`;
      if (data) {
        console.log(consoleMsg, data);
      } else {
        console.log(consoleMsg);
      }
    } catch (error) {
      console.error('Logger error:', error);
    }
  }

  error(message, data = null) {
    this.writeToFile(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = null) {
    this.writeToFile(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this.writeToFile(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this.writeToFile(LOG_LEVELS.DEBUG, message, data);
  }

  // Special method for API requests/responses
  apiLog(method, url, requestData, responseData, statusCode) {
    const apiLogData = {
      method,
      url,
      requestData,
      responseData,
      statusCode,
      timestamp: new Date().toISOString()
    };
    
    this.info(`API ${method} ${url} - Status: ${statusCode}`, apiLogData);
  }

  // Method for Shiprocket specific logs
  shiprocketLog(action, data, error = null) {
    const logData = {
      action,
      data,
      ...(error && { error: error.message })
    };
    
    if (error) {
      this.error(`Shiprocket ${action} failed`, logData);
    } else {
      this.info(`Shiprocket ${action} success`, logData);
    }
  }
}

// Create logger instances
export const mainLogger = new Logger('main');
export const apiLogger = new Logger('api');
export const shiprocketLogger = new Logger('shiprocket');

// Export Logger class for custom loggers
export default Logger;

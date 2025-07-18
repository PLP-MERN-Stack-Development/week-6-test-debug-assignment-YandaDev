// Client-side logging utility
class ClientLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.apiEndpoint = '/api/logs'; // Server endpoint for log collection
  }

  // Log levels
  debug(message, data = {}) {
    this.log('DEBUG', message, data);
  }

  info(message, data = {}) {
    this.log('INFO', message, data);
  }

  warn(message, data = {}) {
    this.log('WARN', message, data);
  }

  error(message, data = {}) {
    this.log('ERROR', message, data);
  }

  // Core logging method
  log(level, message, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };

    // Add to local storage
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = console[level.toLowerCase()] || console.log;
      consoleMethod(`[${level}] ${message}`, data);
    }

    // Store in localStorage
    this.saveToStorage();

    // Send critical errors to server immediately
    if (level === 'ERROR') {
      this.sendToServer([logEntry]);
    }
  }

  // Log error with additional context
  logError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    };

    this.error('JavaScript Error', errorData);
  }

  // Log performance metrics
  logPerformance(metric, value, context = {}) {
    this.info('Performance Metric', {
      metric,
      value,
      ...context
    });
  }

  // Log user interactions
  logUserAction(action, element, context = {}) {
    this.info('User Action', {
      action,
      element,
      ...context
    });
  }

  // Log API calls
  logApiCall(method, url, status, duration, data = {}) {
    const level = status >= 400 ? 'ERROR' : 'INFO';
    this.log(level, 'API Call', {
      method,
      url,
      status,
      duration: `${duration}ms`,
      ...data
    });
  }

  // Get or create session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('debugSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('debugSessionId', sessionId);
    }
    return sessionId;
  }

  // Save logs to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('debugLogs', JSON.stringify(this.logs));
    } catch (e) {
      // Storage quota exceeded, clear old logs
      this.logs = this.logs.slice(-100);
      localStorage.setItem('debugLogs', JSON.stringify(this.logs));
    }
  }

  // Load logs from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('debugLogs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load logs from storage:', e);
      this.logs = [];
    }
  }

  // Send logs to server
  async sendToServer(logs = this.logs) {
    if (!logs.length) return;

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs })
      });
    } catch (error) {
      console.warn('Failed to send logs to server:', error);
    }
  }

  // Get logs for debugging
  getLogs(filter = {}) {
    let filteredLogs = [...this.logs];

    if (filter.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }

    if (filter.since) {
      const since = new Date(filter.since);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= since);
    }

    if (filter.message) {
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(filter.message.toLowerCase())
      );
    }

    return filteredLogs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('debugLogs');
  }

  // Export logs for debugging
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}

// Create global logger instance
const logger = new ClientLogger();

// Load existing logs
logger.loadFromStorage();

// Global error handler
window.addEventListener('error', (event) => {
  logger.logError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.logError(new Error('Unhandled Promise Rejection'), {
    reason: event.reason,
    promise: event.promise
  });
});

// Performance observer for monitoring
if ('PerformanceObserver' in window) {
  const perfObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      logger.logPerformance(entry.entryType, entry.duration, {
        name: entry.name,
        startTime: entry.startTime
      });
    });
  });
  
  perfObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
}

// Expose logger to global scope for debugging
window.debugLogger = logger;

export default logger;

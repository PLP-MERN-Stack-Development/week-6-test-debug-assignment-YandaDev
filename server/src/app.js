// app.js - Express application setup for testing
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Import debugging and logging utilities
const { logger, requestLogger, performanceLogger } = require('./utils/logger');
const { 
  globalErrorHandler, 
  notFoundHandler, 
  handleProcessErrors 
} = require('./middleware/globalErrorHandler');

// Import routes
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set up process error handlers
handleProcessErrors();

// Logging middleware - add early in middleware stack
app.use(requestLogger);

// Performance monitoring (skip in test environment to prevent open handles)
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    performanceLogger.logMemoryUsage();
  }, 60000); // Log memory usage every minute
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log application startup
logger.info('Application middleware configured');

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

// Test routes (only in test/development environment)
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  app.use('/api/test', testRoutes);
}

// Client-side logging endpoint
app.post('/api/logs', (req, res) => {
  const { logs } = req.body;
  
  if (logs && Array.isArray(logs)) {
    logs.forEach(log => {
      logger.info('Client Log', {
        clientLog: true,
        ...log
      });
    });
  }
  
  res.status(200).json({ success: true });
});

// Health check route with detailed information
app.get('/api/health', (req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  logger.info('Health check accessed', healthData);
  res.status(200).json(healthData);
});

// 404 handler (must be before global error handler)
app.use(notFoundHandler);

// Global error handlers
app.use(errorHandler); // Keep existing handler for compatibility
app.use(globalErrorHandler); // New comprehensive error handler

module.exports = app;

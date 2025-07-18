const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

function auth(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    logger.warn('Auth attempt without token', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };
    
    logger.debug('User authenticated', {
      userId: decoded.id,
      username: decoded.username,
      url: req.originalUrl
    });
    
    next();
  } catch (err) {
    logger.warn('Invalid token attempt', {
      error: err.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
    res.status(401).json({ error: 'Token is not valid' });
  }
}

module.exports = auth;

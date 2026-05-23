const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

/**
 * Optional authentication middleware.
 * If a valid Bearer token is provided, attaches the user to `req.user`.
 * Otherwise, sets `req.user = null` and continues.
 */
async function attachUser(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Option 1: Use decoded data directly (fast, no DB query)
    // req.user = { id: decoded.id, name: decoded.name, email: decoded.email };
    
    // Option 2: Fetch fresh user data from DB (ensures user still exists, includes any updates)
    const user = await User.findById(decoded.id).select('-password'); // exclude password
    if (!user) {
      // Token is valid but user no longer exists in DB
      req.user = null;
    } else {
      req.user = user;
    }
  } catch (err) {
    // Invalid token – treat as unauthenticated
    req.user = null;
  }

  next();
}

module.exports = { attachUser };
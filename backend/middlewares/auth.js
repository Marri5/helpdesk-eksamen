const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in cookies or headers
  if (
    req.cookies.token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer'))
  ) {
    // Get token from cookie or header
    token = req.cookies.token || req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ msg: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request object
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
}; 
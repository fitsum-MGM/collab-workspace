const jwt = require('jsonwebtoken')
const User = require('../models/user')

const protect = async (req, res, next) => {
  try {
    let token

    // Check if token exists in headers
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Find user by id and attach to request
      req.user = await User.findById(decoded._id).select('-password')

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' })
      }

      next()

    } else {
      return res.status(401).json({ message: 'No token, not authorized' })
    }

  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' })
  }
}

module.exports = { protect }
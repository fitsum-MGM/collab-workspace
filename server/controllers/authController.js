const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    // Return user info and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Return user info and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get current logged in user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { register, login, getMe }
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const workspaceRoutes = require('./routes/workspaceRoutes')
const documentRoutes = require('./routes/documentRoutes')
const Document = require('./models/Document')
const WorkspaceMember = require('./models/WorkspaceMember')
const jwt = require('jsonwebtoken')

const app = express()
const server = http.createServer(app)

// Allow all origins
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/documents', documentRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' })
})

// Socket.io auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('No token'))
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = payload._id
    next()
  } catch (err) {
    next(new Error('Invalid token'))
  }
})

// Socket.io events
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId)

  socket.on('join-document', async ({ docId }) => {
    try {
      const doc = await Document.findById(docId)
      if (!doc) return socket.emit('error', 'Document not found')

      const member = await WorkspaceMember.findOne({
        workspace: doc.workspace,
        user: socket.userId
      })
      if (!member) return socket.emit('error', 'Access denied')

      socket.join(docId)
      socket.emit('doc-state', {
        content: doc.content,
        version: doc.version
      })
      socket.to(docId).emit('user-joined', { userId: socket.userId })
    } catch (err) {
      socket.emit('error', 'Something went wrong')
    }
  })

  socket.on('send-operation', async ({ docId, op, version }) => {
    try {
      if (!docId || !op) return
      if (!socket.rooms.has(docId)) return

      const doc = await Document.findById(docId)
      if (!doc) return

      doc.content = op
      doc.version += 1
      await doc.save()

      socket.to(docId).emit('receive-operation', {
        op,
        version: doc.version,
        userId: socket.userId
      })
      socket.emit('op-ack', { version: doc.version })
    } catch (err) {
      socket.emit('op-error', 'Failed to save operation')
    }
  })

  socket.on('leave-document', ({ docId }) => {
    socket.leave(docId)
    socket.to(docId).emit('user-left', { userId: socket.userId })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId)
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Connect to MongoDB after the HTTP server is already accepting requests.
const mongoUri = process.env.MONGO_URI

if (!mongoUri) {
  console.warn('MONGO_URI is not set')
} else {
  mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.log('MongoDB connection error:', err))
}
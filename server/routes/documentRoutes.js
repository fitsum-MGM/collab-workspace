const express = require('express')
const router = express.Router()
const {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController')
const { protect } = require('../middleware/authMiddleware')

// All routes are protected
router.post('/', protect, createDocument)
router.get('/workspace/:workspaceId', protect, getDocuments)
router.get('/:id', protect, getDocument)
router.put('/:id', protect, updateDocument)
router.delete('/:id', protect, deleteDocument)

module.exports = router
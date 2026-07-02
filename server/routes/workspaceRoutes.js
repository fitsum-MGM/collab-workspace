const express = require('express')
const router = express.Router()
const {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  addWorkspaceMember
} = require('../controllers/workspaceController')
const { protect } = require('../middleware/authMiddleware')

// All routes are protected
router.post('/', protect, createWorkspace)
router.post('/:id/members', protect, addWorkspaceMember)
router.get('/', protect, getWorkspaces)
router.get('/:id', protect, getWorkspace)

module.exports = router
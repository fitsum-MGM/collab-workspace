const Document = require('../models/Document')
const WorkspaceMember = require('../models/WorkspaceMember')

// Create a new document
const createDocument = async (req, res) => {
  try {
    const { title, workspaceId } = req.body

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' })
    }

    // Check if user is a member of this workspace
    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id
    })

    if (!member) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Create the document
    const document = await Document.create({
      title: title || 'Untitled Document',
      content: {},
      workspace: workspaceId,
      createdBy: req.user._id,
      version: 0
    })

    res.status(201).json(document)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get all documents in a workspace
const getDocuments = async (req, res) => {
  try {
    const { workspaceId } = req.params

    // Check if user is a member of this workspace
    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id
    })

    if (!member) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Get all documents in this workspace
    const documents = await Document.find({
      workspace: workspaceId
    })
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 })

    res.status(200).json(documents)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get a single document by id
const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name email')

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Check if user is a member of this workspace
    const member = await WorkspaceMember.findOne({
      workspace: document.workspace,
      user: req.user._id
    })

    if (!member) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.status(200).json(document)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update document title
const updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body

    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Check if user is a member
    const member = await WorkspaceMember.findOne({
      workspace: document.workspace,
      user: req.user._id
    })

    if (!member) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Update title if provided
    if (title !== undefined) {
      document.title = title
    }

    // Update content if provided
    if (content !== undefined) {
      document.content = content
    }

    await document.save()

    res.status(200).json(document)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete a document
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Only owner can delete
    const member = await WorkspaceMember.findOne({
      workspace: document.workspace,
      user: req.user._id,
      role: 'owner'
    })

    if (!member) {
      return res.status(403).json({ message: 'Only workspace owner can delete documents' })
    }

    await document.deleteOne()

    res.status(200).json({ message: 'Document deleted successfully' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument
}
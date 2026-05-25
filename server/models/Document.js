const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Document',
    trim: true
  },
  content: {
    type: Object,
    default: {}
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

module.exports = mongoose.model('Document', documentSchema)
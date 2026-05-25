const mongoose = require('mongoose')

const operationSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  op: {
    type: Object,
    required: true
  },
  version: {
    type: Number,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Operation', operationSchema)
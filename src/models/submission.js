const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  id: {
    type: String
  },
  problemId: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema, 'Submission');

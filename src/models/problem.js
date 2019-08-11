const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  id: {
    type: String
  },
  queueId: {
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
  orderInQueue: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Problem', ProblemSchema, 'Problem');

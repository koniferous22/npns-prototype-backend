const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  queueId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    max: Date.now
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
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  submissions: [{
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  }]
});

module.exports = mongoose.model('Problem', ProblemSchema, 'Problem');

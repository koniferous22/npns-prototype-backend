const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String,
    default: ''
  },
  parentId: {
  	type: String,
  	default: ''
  }
});

module.exports = mongoose.model('Queue', QueueSchema, 'Queue');

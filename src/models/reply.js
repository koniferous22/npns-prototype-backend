const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
	submission_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Submission'
	}
});

const ReplyModel = mongoose.model('Reply', ReplySchema, 'Reply');

module.exports = ReplyModel

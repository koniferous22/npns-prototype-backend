const mongoose = require('mongoose');

const PostModel = require('./post');

const ReplySchema = new mongoose.Schema({
	challenge: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		index: true,
		ref: 'Challenge'
	},
	submission: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Submission'
	}
});

const options = {
	discriminatorKey: 'kind'
}

const ReplyModel = PostModel.discriminator('Reply', ReplySchema, options)

module.exports = ReplyModel

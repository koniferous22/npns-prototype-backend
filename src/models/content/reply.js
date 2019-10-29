const mongoose = require('mongoose');

const ContentModel = require('./content');

const ReplySchema = new mongoose.Schema({
	problem: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		index: true,
		ref: 'Problem'
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

const ReplyModel = ContentModel.discriminator('Reply', ReplySchema, options)

module.exports = ReplyModel

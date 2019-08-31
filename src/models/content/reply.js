const mongoose = require('mongoose');

const ContentModel = require('./content');

const ReplySchema = new mongoose.Schema({
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

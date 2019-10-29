const mongoose = require('mongoose');

const ContentModel = require('./content');

const SubmissionSchema = new mongoose.Schema({
	replies: [{
		reply: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Reply'
		},
		_id:false
	}],
	problem: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		index: true,
		ref: 'Problem'
	}
});


SubmissionSchema.virtual('reply_count').get(function() {
	return this.replies.length
})

const options = {
	discriminatorKey: 'kind'
}

const SubmissionsModel = ContentModel.discriminator('Submission', SubmissionSchema, options)

module.exports = SubmissionsModel

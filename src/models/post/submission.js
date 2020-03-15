const mongoose = require('mongoose');

const PostModel = require('./post');

const SubmissionSchema = new mongoose.Schema({
	replies: [{
		reply: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Reply'
		},
		_id:false
	}],
	challenge: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		index: true,
		ref: 'Challenge'
	}
});


SubmissionSchema.virtual('reply_count').get(function() {
	return this.replies.length
})

const options = {
	discriminatorKey: 'kind'
}

const SubmissionsModel = PostModel.discriminator('Submission', SubmissionSchema, options)

module.exports = SubmissionsModel

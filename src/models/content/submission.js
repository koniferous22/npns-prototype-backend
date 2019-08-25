const mongoose = require('mongoose');

const ContentModel = require('./content');

const SubmissionSchema = new mongoose.Schema({
	problemId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Problem'
	}
});

const options = {
	discriminatorKey: 'kind'
}

const SubmissionsModel = ContentModel.discriminator('Submission', SubmissionSchema, options)
//mongoose.model('Submission', SubmissionSchema, 'Submission');

module.exports = SubmissionsModel

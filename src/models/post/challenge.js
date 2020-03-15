const mongoose = require('mongoose');

const PostModel = require('./post')

const ChallengeSchema = new mongoose.Schema({
	queue: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Queue'
	},
	root_queue_value: {
		type: Number,
		default: 0,
		index: true
	},
	accepted_submission: {
		type: mongoose.Schema.Types.ObjectId,
		default: null,
		ref: 'Submission'
	},
	title: {
		type: String,
		required: true
	},
	view_count: {
		type: Number,
		default: 0
	},
	boosts: [{
		boost_value: {
			type: Number,
			required: true
		},
		boosted_by: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		paypal_order: {
			type: Object
		},
		_id: false
	}],
	submissions: [{
		submission: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Submission'
		},
		_id: false
	}]
}, {
	toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

const epochBegin = new Date(process.env.EPOCH_BEGIN_YEAR,process.env.EPOCH_BEGIN_MONTH,process.env.EPOCH_BEGIN_DAY)
const epochEnd = new Date(process.env.EPOCH_END_YEAR,process.env.EPOCH_END_MONTH,process.env.EPOCH_END_DAY)
const normalizationCoef = epochEnd - epochBegin

ChallengeSchema.virtual('solved').get(function () {
	return this.accepted_submission != null
})

ChallengeSchema.virtual('bounty').get(function () {
	return 0.98 * this.boosts.reduce((acc,cv) => acc + cv.boost_value, 0)
})

ChallengeSchema.virtual('boost_value').get(function() {
	return this.boosts.map(x => x.boost_value).reduce((a,b) => a + b, 0)
})

ChallengeSchema.methods.calculateChallengeValue = function() {
	const challenge = this
	const boostValue = challenge.boost_value
	const defaultValue = (challenge.created - epochBegin) / normalizationCoef
	if (boostValue > 0) {
		boostValue++
	}
	return defaultValue + boostValue
}

ChallengeSchema.methods.boost = function (boosted_by, boost_value) {
	if (this.accepted_submission != null) {
		throw new Error('Cannot boost already solved challenge')
	}
	this.boosts.concat({boosted_by, boost_value})
}

ChallengeSchema.methods.acceptSolution = function (solution_id) {
	if (!this.submissions.map(x => x.submission).includes(solution_id)) {
		throw new Error('No such submission related to this challenge');
	}
	this.active = false;
	this.accepted_submission = solution_id
	return true
}

/*
ChallengeSchema.methods.editChallenge = async function (posts) {
	this.edits.push({posts})
	await this.save()
}*/

ChallengeSchema.virtual('submission_count').get(function() {
	return this.submissions.length
})

ChallengeSchema.pre('save', async function (next) {
	const challenge = this
	//console.log(challenge)
	if (challenge.isNew || challenge.isModified('boosts') || challenge.isModified('root_queue_value')) {
		challenge.root_queue_value = this.calculateChallengeValue()
	}
	next()
})

ChallengeSchema.statics.viewChallenge = async function (id) {
	const challenge = await this
		.findOne({_id:id})
		.populate({
			path: 'submitted_by',
		    select: 'username',
		})
		.populate({
			path: 'queue',
			select: 'name -_id'
		})
		.populate('accepted_submission')

	challenge.view_count++
	await challenge.save()
	return challenge
}

const schema_options = {
	discriminatorKey: 'kind'
}



const ChallengeModel = PostModel.discriminator('Challenge', ChallengeSchema, schema_options)

/*
METHODS:
* change queue
* implement karma calculator
*/



module.exports = ChallengeModel

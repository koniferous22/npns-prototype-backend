const mongoose = require('mongoose');

const ContentModel = require('./content')

const ProblemSchema = new mongoose.Schema({
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

ProblemSchema.virtual('solved').get(function () {
	return this.accepted_submission != null
})

ProblemSchema.virtual('bounty').get(function () {
	return 0.98 * this.boosts.reduce((acc,cv) => acc + cv.boost_value, 0)
})

ProblemSchema.virtual('boost_value').get(function() {
	return this.boosts.map(x => x.boost_value).reduce((a,b) => a + b, 0)
})

ProblemSchema.methods.calculateProblemValue = function() {
	const problem = this
	const boostValue = problem.boost_value
	const defaultValue = (problem.created - epochBegin) / normalizationCoef
	if (boostValue > 0) {
		boostValue++
	}
	return defaultValue + boostValue
}

ProblemSchema.methods.boost = async function (boosted_by, boost_value) {
	if (this.accepted_submission != null) {
		throw new Error('Cannot boost already solved problem')
	}
	this.boosts.concat({boosted_by, boost_value})
}

ProblemSchema.methods.acceptSolution = function (solution_id) {
	if (!this.submissions.map(x => x.submission).includes(solution_id)) {
		throw new Error('No such submission related to this problem');
	}
	this.active = false;
	this.accepted_submission = solution_id
	return true
}

/*
ProblemSchema.methods.editProblem = async function (contents) {
	this.edits.push({contents})
	await this.save()
}*/

ProblemSchema.virtual('submission_count').get(function() {
	return this.submissions.length
})

ProblemSchema.pre('save', async function (next) {
	const problem = this
	//console.log(problem)
	if (problem.isNew || problem.isModified('boosts') || problem.isModified('root_queue_value')) {
		problem.root_queue_value = this.calculateProblemValue()
	}
	next()
})

ProblemSchema.statics.viewProblem = async function (id) {
	const problem = await this
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

	problem.view_count++
	await problem.save()
	return problem
}

const schema_options = {
	discriminatorKey: 'kind'
}



const ProblemModel = ContentModel.discriminator('Problem', ProblemSchema, schema_options)

/*
METHODS:
* change queue
* implement karma calculator
*/



module.exports = ProblemModel

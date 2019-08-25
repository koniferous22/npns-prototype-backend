const mongoose = require('mongoose');

const ContentModel = require('./content')

const ProblemSchema = new mongoose.Schema({
	queue_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Queue'
	},
	rootQueueValue: {
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
  		}
  	}],
  	submissions: [{
  		submission_id: {
  			type: mongoose.Schema.Types.ObjectId,
  			required: true,
  			ref: 'Submission'
  		}
  	}]
});

const epochBegin = new Date(2019,1,1)
const epochEnd = new Date(2020,1,1)
const normalizationCoef = epochEnd - epochBegin

ProblemSchema.virtual('solved').get(function () {
	return this.accepted_submission != null
})

ProblemSchema.virtual('bounty').get(function () {
	return 0.98 * this.boosts.reduce((a,b) => a + b, 0)
})

ProblemSchema.methods.calculateProblemValue = function() {
	const problem = this
	const defaultValue = (problem.created - epochBegin) / normalizationCoef
	const boostValue = problem.boosts.map(x => x.boost_value).reduce((a,b) => a + b, 0)
	if (boostValue > 0) {
		boostValue++
	}
	return defaultValue + boostValue
}

ProblemSchema.methods.boost = async function (boosted_by, boost_value) {
	this.boosts.concat({boosted_by, boost_value})
	await this.save()
	return true
}

/*ProblemSchema.methods.submitSolution = async function () {
	
}*/
/*
ProblemSchema.methods.editProblem = async function (contents) {
	this.edits.push({contents})
	await this.save()
}*/

ProblemSchema.virtual('submission_count').get(function() {
	return this.submissions.filter(x => x.hiddenBy === null).length
})

ProblemSchema.pre('save', async function (next) {
	const problem = this
	console.log(problem)
	if (problem.isNew || problem.isModified('boosts') || problem.isModified('rootQueueValue')) {
		problem.rootQueueValue = this.calculateProblemValue()
	}
	next()
})

ProblemSchema.statics.viewProblem = async function (id) {
	const problem = await this.findOne({_id:id}/*,{rootQueueValue: 0}*/)
	problem.view_count++
	await problem.save()
	return problem
}

const options = {
	discriminatorKey: 'kind'
}

const ProblemModel = ContentModel.discriminator('Problem', ProblemSchema, options)
//mongoose.model('Problem', ProblemSchema, 'Problem');

/*
METHODS:
* change queue
* implement karma calculator
*/



module.exports = ProblemModel

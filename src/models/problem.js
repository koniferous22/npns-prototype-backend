const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
	queue_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Queue'
	},
	submitted_by: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
		index: true
	},
	created: {	
	    type: Date,
		default: Date.now,
		max: Date.now
	},
	rootQueueValue: {
		type: Number,
		default: 0,
		index: true
	},
	active: {
		type: Boolean,
		default: true
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
	description: {
    	type: String,
		default: ''
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


const ProblemModel = mongoose.model('Problem', ProblemSchema, 'Problem');

/*
METHODS:
* change queue
* implement karma calculator
*/



module.exports = ProblemModel

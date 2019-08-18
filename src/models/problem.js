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
	rootQueueValue: { // float timestamp + (if boosted then 1 else 0) + bounty
		type: Number,
		default: 0,
		index: true
	},
	active: {
		type: Boolean,
		default: true
	},
	solved: {
		type: Boolean,
		default: false
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

ProblemSchema.method.calculateProblemValue = function() {
	console.log(this.created)
	console.log(epochBegin)
	console.log(this.created - epochBegin)
}

ProblemSchema.method.view = async function () {
	
}

const ProblemModel = mongoose.model('Problem', ProblemSchema, 'Problem');

/*
* problem when creating a problem: how to assign  orderInRootQueue
* 
*/

/*
METHODS:
* boost
* increment view count (view function)
* 
* bounty (virtual)
* change queue
* find self and descendant queues by page and offset (try with cached response)
* implement karma calculator
*/



module.exports = ProblemModel

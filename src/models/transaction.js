const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
	sender: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'User',
    	default: null
	},
	recipient: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'User',
    	default: null
	},
	queue: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Queue',
    	default: null
	},
	karmaValue: {
		type: Number,
		default: 0
	},
	monetaryValue: {
		type: Number,
		default: 0
		// refactor with currency enum
	},
	created: {
		type: Date,
		default: Date.now,
		index: true,
		max: Date.now
	},
	description: {
		// compress message into enum values, so that the whole fucking string doesn't have to be stored
		type: String,
		required: true
	},
	meta: {
		type: Map,
		of: String,
		default: {}
	}

})

TransactionSchema.pre('validate', function (next) {
	if (!this.sender && !this.recipient) {
		next(new Error('Transaction has to have either sender or recipient specified'))
	} else if (this.karma_value === 0 && this.monetary_value === 0) {
		next(new Error('Transaction has to have non-zero karma or monetary value'))
	} else {
		next()
	}
})

const TransactionModel = mongoose.model('Transaction', TransactionSchema, 'Transaction');

module.exports = TransactionModel
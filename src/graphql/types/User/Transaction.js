const mongoose = require('mongoose');

const TransactionDbSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true
	},
	from: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null
	},
	to: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null
	},
	amount: {
		type: Number,
		// refactor with currency enum
		default: 0
	},
	karmaAmount: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Date,
		default: Date.now,
		index: true,
		max: Date.now
	},
	meta: {
		// TODO define custom validator, that would for each transaction type validate correct transaction meta
		relatedQueue: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Queue'
		}
	}
})

const TransactionSchema = `
	type Transaction {
		type: String!,
		from: User,
		to: User,
		amount: Int!,
		karmaAmount: Int!,
		meta: String
	}

`

const TransactionResolvers = {

}

module.exports = {
	TransactionDbSchema,
	TransactionSchema,
	TransactionResolvers
}
import mongoose  from 'mongoose';

import { TimestampSchemaTypeCreator } from '../utils/schemaTypeCreators'

export const TransactionDbSchema = new mongoose.Schema({
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
	createdAt: TimestampSchemaTypeCreator(),
	meta: {
		// TODO define custom validator, that would for each transaction type validate correct transaction meta
		relatedQueue: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Queue'
		}
	}
})

export const TransactionSchema = `
	type Transaction {
		type: String!,
		from: User,
		to: User,
		amount: Int!,
		karmaAmount: Int!,
		meta: String
	}

`

export const TransactionResolvers = {

}

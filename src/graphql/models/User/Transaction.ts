import mongoose  from 'mongoose';

import { TimestampSchemaTypeCreator } from '../../utils/subSchemaCreators';

export type TransactionMetaType = {
	relatedQueue?: mongoose.Types.ObjectId;
}

export interface TransactionType extends mongoose.Types.Subdocument {
	type: string;
	from: mongoose.Types.ObjectId | string;
	to: mongoose.Types.ObjectId;
	amount: number;
	karmaAmount: number;
	createdAt: Date;
	meta: TransactionMetaType;
}

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
	type TransactionMeta {
		relatedQueue: Queue
	}

	type Transaction {
		type: String!
		from: User
		to: User
		amount: Int!
		karmaAmount:Int!
		createdAt: Date!
		meta: TransactionMeta
	}

`

export const TransactionResolvers = {

}

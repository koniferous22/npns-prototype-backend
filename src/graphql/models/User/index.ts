import mongoose  from 'mongoose';
import bcrypt  from 'bcrypt';
import jwt  from 'jsonwebtoken';
import validator  from 'validator';

import {
	TransactionMetaType,
	TransactionType,
	TransactionDbSchema,
	TransactionSchema, 
	TransactionResolvers
} from './Transaction'

import Challenge from '../Challenge'
import Queue from '../Queue'

import { calculatePageCount } from '../../../utils'

import { PagingType, PagingSizeType } from '../../utils/types'
import {
	PasswordSchemaTypeCreator,
	EmailSchemaTypeCreator
} from '../../utils/subSchemaCreators'

const AuthTokenDbSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 12000
	}
})

interface KarmaEntryType extends mongoose.Types.Subdocument {
	queue: mongoose.Types.ObjectId;
	karma: number;
}

const KarmaEntryDbSchema = new mongoose.Schema({
	queue: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Queue'
	},
	karma: {
		type: Number,
		required: true,
		min: 0
	}
})

export interface UserType extends mongoose.Document {
	username: string;
	password: string;
	email: string;
	firstName: string
	lastName: string;
	wallet: number;
	referredBy: string;
	verified: boolean;
	allowNsfw: boolean;
	karmaEntries: KarmaEntryType[];
	transactions: TransactionType[];

	getField<T>(field: string, populatePath?: string): Promise<T>;
	isPasswordValid(password: string): Promise<boolean>;
	setUserVerified(): UserType;
	addTransaction(
		type: string,
		from: mongoose.Types.ObjectId | string,
		to: mongoose.Types.ObjectId,
		amount: number,
		karmaAmount: number,
		meta: TransactionMetaType
	): UserType;
	addBalance(
		queueId: mongoose.Types.ObjectId,
		amount: number,
		karmaAmount: number
	): UserType
}

const UserDbSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		index: true
	},
	password: PasswordSchemaTypeCreator(),
	email: EmailSchemaTypeCreator(),
	firstName: {
		type: String,
		default: ''
	},
	lastName: {
		type: String,
		default: ''
	},
	wallet: {
		type: Number,
		default: 0
	},
	referredBy: {
		type: String,
		default: ''
	},
	verified: {
		type: Boolean,
		default: false
	},
	allowNsfw: {
		type: Boolean,
		default: false
	},
	transactions: [TransactionDbSchema],
	karmaEntries: [KarmaEntryDbSchema]
})

UserDbSchema.statics.findByIdentifier = function (identifier: string) {
	const predicate = validator.isEmail(identifier) ? {email:identifier} : {username:identifier}
	return this.findOne(predicate)
}
UserDbSchema.statics.signUp = function (username: string, password: string, email: string, firstName: string, lastName: string) {
	return new this({ username, password, email, firstName, lastName })
}
UserDbSchema.statics.signIn = async function (identifier: string, password: string) {
	const user = await this.findByIdentifier(identifier)	
	if (!user) {
		throw new Error('Invalid login credentials')
	}
	const hasValidPassword = await user.isPasswordValid(password);
	if (!hasValidPassword) {
		throw new Error('Invalid login credentials')
	}

	return user
}
UserDbSchema.statics.generatePasswordHash = function (pwd: string) {
	return bcrypt.hashSync(pwd, bcrypt.genSaltSync(8))
}
UserDbSchema.statics.areIdentifiersAvailable = function (username: string, email: string) {
	return this.exists({
		$or: [
			{username},
			{email}
		]
	})
}
UserDbSchema.methods.getField = async function <T>(field: string, populatePath?: string): Promise<T> {
	return (await this.populate(populatePath || field).execPopulate())[field]
} 
UserDbSchema.methods.isPasswordValid = function (comparedPassword: string) {
	return bcrypt.compare(this.password, comparedPassword)
}

UserDbSchema.methods.setUserVerified = function () {
	if (!!this.verified) {
		throw new Error('User already verified')
	}
	this.verified = true
	return this
}
UserDbSchema.methods.addTransaction = function (
	type: string,
	from: mongoose.Types.ObjectId | string,
	to: mongoose.Types.ObjectId,
	amount: number,
	karmaAmount: number,
	meta: TransactionMetaType
) {
	this.transactions.push({
		type,
		from,
		to,
		amount,
		karmaAmount,
		meta
	});
	return this
}
UserDbSchema.methods.addBalance = function (
	queueId: mongoose.Types.ObjectId,
	amount: number,
	karmaAmount: number
) {
	let karmaEntry = (this as UserType).karmaEntries.find(({ queue }) => queue === queueId)
	if (!karmaEntry) {
		karmaEntry = this.karmaEntries.create({
			queue: queueId,
			karma: karmaAmount
		})
		this.karmaEntries.push(karmaEntry)
	} else {
		karmaEntry.karma += karmaAmount
	}
	this.wallet += amount
	return this	
}

interface UserModelType extends mongoose.Model<UserType> {
	findByIdentifier(identifier: string): Promise<UserType>;
	signUp(username: string, password: string, email: string, firstName: string, lastName: string): UserType;
	signIn(identifier: string, password: string): Promise<UserType>;
	generatePasswordHash(password: string): string;
	areIdentifiersAvailable(username: string, email: string): Promise<boolean>;
}

export default mongoose.model<UserType>('User', UserDbSchema, 'User') as UserModelType;

export const UserSchema = `
	${TransactionSchema}

	type KarmaEntry {
		queue: Queue!
		karma: Int!
	}

	type User {
		# Basic data
		username: String!
		email: String!
		firstName: String
		lastName: String
		# referral
		referredBy: User
		# misc
		verified: Boolean!
		allowNsfw: Boolean!
		
		# scoreboard
		karmaEntries: [KarmaEntry!]!
		# related transactions
		transactions(paging: Paging, authToken: String!): [Transaction!]!
		transactionPageCount(pageSize: Int, authToken: String!): Int!

		# todo define activity
	}
`

export const UserResolvers = {
	referredBy: (user: UserType) => user.getField<UserType>('referredBy'),
	// TODO: added default params, make sure that typescript allows non-negative params in functions
	transactions: async (user: UserType, { paging = { page: 1, pageSize: 50 }, authToken }: { paging: PagingType; authToken: string }) => {
		// TODO VERIFY THAT USER IS LOGGED IN
		return user.transactions
	},
	transactionPageCount: async (user: UserType, { pageSize = 50 }: PagingSizeType) => calculatePageCount(user.transactions.length, pageSize),
}

export const UserNestedResolvers = {
	Transaction: TransactionResolvers
}

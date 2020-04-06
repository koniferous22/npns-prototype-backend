import mongoose  from 'mongoose';
import bcrypt  from 'bcrypt';
import jwt  from 'jsonwebtoken';
import validator  from 'validator';

import { Challenge } from '../Challenge'
import { Submission } from '../Challenge/Submission'
import { Reply } from '../Challenge/Reply'

import { Queue } from '../Queue'

import { TransactionDbSchema, TransactionSchema, TransactionResolvers } from './Transaction'
import { calculatePageCount } from '../../../utils'

import {
	PasswordSchemaTypeCreator,
	EmailSchemaTypeCreator
} from '../utils/schemaTypeCreators'

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
	transactions: [TransactionDbSchema],
	karmaEntries: [KarmaEntryDbSchema],
	allowNsfw: {
		type: Boolean,
		default: false
	}
})

UserDbSchema.statics.findByIdentifier = function (identifier) {
	const predicate = validator.isEmail(identifir) ? {email:identifier} : {username:identifier}
	return this.findOne(predicate)
}
UserDbSchema.statics.signUp = function (username, password, email, firstName, lastName) {
	return new this({ username, password, email, firstName, lastName })
}
UserDbSchema.statics.signIn = async function (identifier, password) {
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
UserDbSchema.statics.generatePasswordHash = function (pwd) {
	return bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null)
}
UserDbSchema.statics.areIdentifiersAvailable = function (username, email) {
	return this.exists({
		$or: [
			{username},
			{email}
		]
	})
}
UserDbSchema.methods.getField = async function (field, populatePath) {
	return (await this.populate(populatePath || field).execPopulate())[field]
} 
UserDbSchema.methods.isPasswordValid = function (comparedPassword) {
	return bcrypt.compare(this.password, comparedPassword)
}

UserDbSchema.methods.setUserVerified = function () {
	if (!!this.verified) {
		throw new Error({error: 'User already verified'})
	}
	this.verified = true
	return this
}
UserDbSchema.methods.addTransaction = function (type, { from, to }, amount, karmaAmount, meta) {
	this.transactions.push({
		type,
		from,
		to,
		amount,
		karmaAmount,
		createdAt,
		meta
	});
	return this
}
UserDbSchema.methods.addBalance = async function (queueName, amount, karmaAmount) {
	const challengeQueue = await Queue.findByName(queueName)
	let karmaEntry = this.karmaEntries.find(({ queue }) => queue === relatedQueue.id)
	if (!karmaEntry) {
		karmaEntry = {
			queue: relatedQueue.id,
			karma: karmaAmount
		}
		this.karmaEntries.push(karmaEntry)
	} else {
		karmaEntry.karma += karmaAmount
	}
	this.wallet += amount
	return this	
}

export const User = mongoose.model('User', UserDbSchema, 'User');

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

		# related posts		
		posts(paging: Paging): [Challenge!]!
		postPageCount(pageSize: Int): Int!
		# misc statistics
		numberOfChallenges: Int!
		numberOfSubmissions: Int!
		numberOfReplies: Int!
	}
`

export const UserResolvers = {
	referredBy: async user => UserMethods.getField(user, 'referredBy'),
	// TODO: added default params, make sure that typescript allows non-negative params in functions
	transactions: async (user, { paging = { page: 1, pageSize: 50 }, authToken }) => {
		// TODO VERIFY THAT USER IS LOGGED IN
		return user.transactions
	},
	transactionPageCount: async (user, { pageSize = 50 }) => calculatePageCount(user.transactions.length, pageSize),

	posts: async (user, { paging = { page: 1, pageSize: 50 }}) => {
		const { page, pageSize } = paging
		const userPosts = await Post.find({submitted_by: user._id}).skip(pageSize * (page - 1)).limit(pageSize)
		return userPosts
	},
	postPageCount: async (user, { pageSize = 50 }) => {
		const postCount = await Post.countDocuments({submitted_by: user._id});
		const pageCount = calculatePageCount(postCount, pageSize)
		return pageCount
	},

	numberOfChallenges: user => Challenge.countDocuments({submitted_by: user._id}),
	numberOfSubmissions: user => Submission.countDocuments({submitted_by: user._id}),
	numberOfReplies: user => Reply.countDocuments({submitted_by: user._id})
}

export const UserNestedResolvers = {
	Transaction: TransactionResolvers
}

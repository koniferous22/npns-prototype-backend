const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const Transaction = require('../../models/transaction')
const Post = require('../../models/post/post')
const Challenge = require('../../models/post/challenge')
const Submission = require('../../models/post/submission')
const Reply = require('../../models/post/reply')

const { QueueMethods, QUEUE_FIELDS } = require('./Queue')
const { calculatePageCount } = require('../../utils')

const AuthTokenDbSchema = mongoose.Schema({
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

const TransactionDbSchema = mongoose.Schema({
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

const KarmaEntryDbSchema = mongoose.Schema({
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
const UserDbSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		index: true
	},
	password: {
		type: String,
		required: true,
		minLength: 8
	},
	email: {
		type: String,
		required: true,
		unique: true,
		index: true,
		lowercase: true,
		validate: value => {
			if (!validator.isEmail(value)) {
				throw new Error({error: 'Invalid Email address'})
			}
		}
	},
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

const UserModel = mongoose.model('User', UserDbSchema, 'User');

const USER_FIELDS = 'username password email firstName lastName wallet referredBy verified transactions karmaEntries allowNsfw'

const UserMethods = {
	findByIdentifier: (identifier) => {
		const predicate = validator.isEmail(identifier) ? {email:identifier} : {username:identifier}
		return UserModel.findOne(predicate, USER_FIELDS)
	},
	signIn: async (identifier, password) => {
		const user = await findByIdentifier(identifier)	
		if (!user) {
			throw new Error('Invalid login credentials')
		}
		const hasValidPassword = await isPasswordValid(user,password);
		if (!hasValidPassword) {
			throw new Error('Invalid login credentials')
		}

		return user
	},
	generatePasswordHash: (pwd) => bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null),
	areIdentifiersAvailable: (username, email) => UserModel.exists({
		$or: [
			{username},
			{email}
		]
	}),

	getField: async (user, field, populatePath) => (await user.populate(populatePath || field).execPopulate())[field],
	isPasswordValid: (user, comparedPassword) => bcrypt.compare(user.password, comparedPassword),

	setUserVerified: (user) => {
		if (!!user.verified) {
			throw new Error({error: 'User already verified'})
		}
		user.verified = true
		return user
	},
	addTransaction: (user, type, { from, to }, amount, karmaAmount, meta) => {
		user.transactions.push({
			type,
			from,
			to,
			amount,
			karmaAmount,
			createdAt,
			meta
		});
		return user
	},
	addBalance: async (user, queueName, amount, karmaAmount) => {
		const challengeQueue = await QueueMethods.findByName(queueName)
		let karmaEntry = user.karmaEntries.find(({ queue }) => queue === relatedQueue.id)
		if (!karmaEntry) {
			karmaEntry = {
				queue: relatedQueue.id,
				karma: karmaAmount
			}
			user.karmaEntries.push(karmaEntry)
		} else {
			karmaEntry.karma += karmaAmount
		}
		user.wallet += amount
		return user	
	}
}

const UserSchema = `
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

const User = {
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
		const pageCount = Math.floor(postCount / pageSize) + (postCount % pageSize > 0 ? 1 : 0)
		return pageCount
	},

	numberOfChallenges: user => Challenge.countDocuments({submitted_by: user._id}),
	numberOfSubmissions: user => Submission.countDocuments({submitted_by: user._id}),
	numberOfReplies: user => Reply.countDocuments({submitted_by: user._id})
}

module.exports = {
	USER_FIELDS,
	UserMethods,
	UserSchema,
	User
}

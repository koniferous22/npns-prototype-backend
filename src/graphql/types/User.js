const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const Transaction = require('../../models/transaction')
const Post = require('../../models/post/post')
const Challenge = require('../../models/post/challenge')
const Submission = require('../../models/post/submission')
const Reply = require('../../models/post/reply')

const { QUEUE_FIELDS, USER_FIELDS } = require('../utils/queryFields')

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
	referredBy: {
		type: String,
		default: ''
	},
	verified: {
		type: Boolean,
		default: false
	},
	balanceEntries: [{
		queue: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Queue'
		},
		balance: {
			type: Number,
			min: 0
		}
	}],
	allowNsfw: {
		type: Boolean,
		default: false
	}
})

const UserModel = mongoose.model('User', UserDbSchema, 'User');

const UserMethods = {
	findByIdentifier: async (identifier) => {
		const predicate = validator.isEmail(identifier) ? {email:identifier} : {username:identifier}
	    const user = await UserModel.findOne(predicate, USER_FIELDS)
	    return user
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

	generateAuthToken: async (user) => {
		const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    	user.tokens.push({ token })
    	await user.save()
    	return token
	},
	setUserVerified: async (user) => {
		if (!!user.verified) {
			throw new Error({error: 'User already verified'})
		}
		user.verified = true
		await user.save()
	}
}

const UserSchema = `
	type Balance {
		queue: Queue!
		balance: Int!
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
		balanceEntries: [Balance!]!
		verified: Boolean!
		allowNsfw: Boolean!
		
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
	balanceEntries: user => UserMethods.getField(user, 'balanceEntries', 'balanceEntries.balance'),
	referredBy: async user => UserMethods.getField(user, 'referredBy'),
	// TODO: added default params, make sure that typescript allows non-negative params in functions
	transactions: async (user, { paging = { page: 1, pageSize: 50 }, authToken }) => {
		const { page, pageSize } = paging	
		const transactions = await Transaction.find({$or: [
			{
				sender: user.id
			},
			{
				recipient: user.id
			}
		]}).sort({created: 'desc'}).skip(pageSize * (page - 1))
		return transactions
	},
	transactionPageCount: async (user, { pageSize = 50 }) => {
		const transactionCount = await Transaction.countDocuments({$or: [
			{
				sender: user.id
			},
			{
				recipient: user.id
			}
		]})
		const pageCount = Math.floor(transactionCount / pageSize) + (transactionCount % pageSize > 0 ? 1 : 0)
		return pageCount
	},

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

	numberOfChallenges: async user => Challenge.countDocuments({submitted_by: user._id}),
	numberOfSubmissions: async user => Submission.countDocuments({submitted_by: user._id}),
	numberOfReplies: async user => Reply.countDocuments({submitted_by: user._id})
}

module.exports = {
	UserMethods,
	UserSchema,
	User
}

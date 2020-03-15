const validator = require('validator')

const Queue = require('../../models/queue')
const User = require('../../models/user')
const Challenge = require('../../models/post/challenge')

const { QUEUE_FIELDS } = require('../utils/queryFields')
const { authentication } = require('../../utils/authentication')

const validateResolvers = {
	username: async (username, _) => {
		if (!username || username === '') {
			throw new Error('No username submitted')
		}
		const user_with_username = await User.find({username}).limit(1)
		if (user_with_username.length > 0) {
			throw new Error('Username taken')
		}
		return true
	},
	email: async (email, _) => {
		if (!email || !validator.isEmail(email)) {
			throw new Error('Invalid email')
		}
		const user_with_email = await User.find({email}).limit(1)
		if (user_with_email.length > 0) {
			throw new Error('Email taken')
		}
		return true
	},
	password: async (password, token) => {
		if (!password) {
			throw new Error('No password specified')
		}
		if (password.length < 8) {
			throw new Error('Too short')
		}
		if (token) {
			const isPasswordUsed = await authentication(token).then(user => user.validPassword(password))
			if (isPasswordUsed) {
				throw new Error('Password is same as previous one')
			}
		}
		return true
	},
	referredBy: async (referredBy, _) => {
		if (!referred_by || referred_by === '') {
			throw new Error('No referal user specified')
		}
		const referal = await User.find({username: referred_by}).limit(1)
		if (referal.length === 0) {
			throw new Error('Entered invalid referal')
		}
		return true
	}

}

const querySchema = `
	# NOTE: none of the data is actually mandatory, there for no exclamation marks
	enum ValidationCombinator {
		AND,
		OR
	}

	input ValidatedUserData {
		username: String,
		email: String,
		password: String,
		referredBy: ID,
		operation: ValidationCombinator
	}

	type Query {
		queues: [Queue!]!
		queue(name: String!): Queue
		user(username: String!): User
		challenge(challengeId: ID!): Challenge
		
		# special shit-code queries
		# also chose to implement token as extra argument, as it serves as behaviour switch, when requesting pwd reset
		validate(validatedUserData: ValidatedUserData!, token: String): Boolean!
	}

`

const Query = {
	queues: async () => await Queue.find({}, QUEUE_FIELDS).sort({name: 'asc'}),
	queue: async (_, {name}) => await Queue.findOne( {name} , QUEUE_FIELDS),

	user: async (_, {username}) => await User.findOne().byLogin(username),
	challenge: async (_, {challengeId}) => await Challenge.viewProblem(challengeId),
	validate: async (_, { validatedUserData, token }) => {
		const { operation, ...data } = validatedUserData
		const validationPromises = Object.entries(data)
			.filter(([validatedField, _]) => validateResolvers[validatedField])
			.map(([validatedField, validatedValue]) => validateResolvers[validatedField](validatedValue, token))
		// TODO: Test this shit pls
		return operation === 'OR' ? Promise.any(validationPromises) : Promise.all(validationPromises)
	}
}

module.exports = {
	querySchema,
	Query
}

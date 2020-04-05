const validator = require('validator')

const { Queue } = require('../types/Queue')
const { Challenge } = require('../types/Challenge')

const { User } = require('../types/User');
const { authentication } = require('../../utils/authentication')

const validateResolvers = {
	username: async (username, _) => {
		if (!username || username === '') {
			throw new Error('No username submitted')
		}
		const userWithUsername = await User.findByIdentifier(username);
		if (!userWithUsername) {
			throw new Error('Username taken')
		}
		return true
	},
	email: async (email, _) => {
		if (!email || !validator.isEmail(email)) {
			throw new Error('Invalid email')
		}
		const userWithEmail = await User.findByIdentifier(email)
		if (!userWithEmail) {
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
		if (!referredBy || referredBy === '') {
			throw new Error('No referal user specified')
		}
		const referal = await User.findByIdentifier(referredBy)
		if (!referal) {
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
	queues: async () => await Queue.findAll(),
	queue: async (_, {name}) => await Queue.findByName(name),

	user: (_, {username}) => User.findByIdentifier(username),
	challenge: (_, {challengeId}) => Challenge.viewChallenge(challengeId),
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

const QueueAPI = require('../models/queue')
const UserAPI = require('../models/user')
const ChallengeAPI = require('../models/content/problem')
const VerificationTokenAPI = require('../models/verification_token/verification_token')

const Challenge = require('./accessors/Challenge')
const Queue = require('./accessors/Queue')
const Submission = require('./accessors/Submission')
const Transaction = require('./accessors/Transaction')
const User = require('./accessors/User')

const { signupTemplate } = require('../nodemailer/templates')

const { QUEUE_FIELDS } = require('./constants')

const Query = {
	queues: async () => await QueueAPI.find({}, QUEUE_FIELDS).sort({name: 'asc'}),
	queue: async (_, {name}) => await QueueAPI.findOne( {name} , QUEUE_FIELDS),

	user: async (_, {username}) => await UserAPI.findOne().byLogin(username),
	challenge: async (_, {challengeId}) => await ChallengeAPI.viewProblem(challengeId)
}
const Mutation = {
	userSignUp: (_, signUpData) => {
		const user = new UserAPI(signUpData)
		return user.save().then(savedUser => {
			const token = new VerificationTokenAPI({user: user._id})
			return token.save()
		}).then(savedToken => {
			return user.sendEmail(signupTemplate, {token: savedToken.token})
		}).then(mailInfo => {
			return user
		})
	}
}

module.exports = {
	Challenge,
	Queue,
	User,
	Submission,
	Transaction,
	Query,
	Mutation
}

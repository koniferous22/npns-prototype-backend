const AuthTokenAPI = require('../models/auth_token')
const QueueAPI = require('../models/queue')
const UserAPI = require('../models/user')
const ChallengeAPI = require('../models/content/problem')
const SubmissionAPI = require('../models/content/submission')
const ReplyAPI = require('../models/content/reply')
const VerificationTokenAPI = require('../models/verification_token/verification_token')

const Content = require('./accessors/Content')
const Challenge = require('./accessors/Challenge')
const Queue = require('./accessors/Queue')
const Submission = require('./accessors/Submission')
const Transaction = require('./accessors/Transaction')
const User = require('./accessors/User')

const Authentication = require('../utils/authentication')

const { signupTemplate } = require('../nodemailer/templates')

const { QUEUE_FIELDS, CHALLENGE_FIELDS, USER_FIELDS, SUBMISSION_FIELDS } = require('./constants')

const Query = {
	queues: async () => await QueueAPI.find({}, QUEUE_FIELDS).sort({name: 'asc'}),
	queue: async (_, {name}) => await QueueAPI.findOne( {name} , QUEUE_FIELDS),

	user: async (_, {username}) => await UserAPI.findOne().byLogin(username),
	challenge: async (_, {challengeId}) => await ChallengeAPI.viewProblem(challengeId)
}
const Mutation = {
	signUpUser: (_, {signUpUserInput}) => {
		const user = new UserAPI(signUpUserInput)
		return UserAPI.find({$or: [{username: signUpUserInput.username}, {email: signupTemplate.email}]}).then(usersFound => {
			if (usersFound.length > 0) {
				throw new Error ('User with same identifier already exists')
			}
			return user.save().then(savedUser => {
				const token = new VerificationTokenAPI({user: user._id})
				return token.save()
			}).then(savedToken => {
				return user.sendEmail(signupTemplate, {token: savedToken.token})
			}).then(mailInfo => {
				return {createdUser: user}
			}).catch(error => {
				console.log('jebal pes')
				throw error
			})
		})
	},
	signInUser: (_, {signInUserInput}) => UserAPI.find().byCredentials(signInUserInput.identifier, signInUserInput.password).then(user => {
		if (!user) {
			throw new Error('Login failed! Check authentication credentials')
		}
		if (!user.verified) {
			throw new Error('not verified, check your email')
		}
		return AuthTokenAPI.generate(user._id).then(token => ({
			user,
			token: token.token
		}))
	}),
	logoutUser: (_, {logoutInput}) => Authentication(logoutInput.token).then(() => AuthTokenAPI.deleteOne({token: logoutInput.token})).then(() => ({message: 'Logged out!'})),
	logoutUserAllDevices: (_, {logoutInput}) => Authentication(logoutInput.token).then(user => AuthTokenAPI.deleteMany({user: user._id})).then(() => ({message: 'Logged out!'})),
	confirmPassword: (_, {confirmPasswordInput}) => Authentication(confirmPasswordInput.token)
		.then(user => {
			console.log(JSON.stringify(confirmPasswordInput))
			return user.validPassword(confirmPasswordInput.password)
		})
		.then(() => {
			console.log('kokot')
			return ({message: 'Password valid'})}),
	postChallenge: (_, {postChallengeInput}) => Promise.all([Authentication(postChallengeInput.token), QueueAPI.findOne({name: postChallengeInput.queueName})]).then(([user, queue]) => {
		const challenge = new ChallengeAPI({
			title: postChallengeInput.title,
			content: postChallengeInput.description,
			submitted_by: user._id,
			queue: queue._id

		})
		return challenge.save().then(() => ({challenge}));
	}),
	postSubmission: (_, {postSubmissionInput}) => Promise.all([Authentication(postSubmissionInput.token), ChallengeAPI.findOne({_id: postSubmissionInput.relatedChallenge})])
		.then(([user, challenge]) => {
			const submission = new SubmissionAPI({
				content: postSubmissionInput.content,
				submitted_by: user._id,
				problem: challenge._id
			})
			return Promise.all([
				submission.save(),
				ChallengeAPI.updateOne(
		        	{ _id: challenge._id},
		        	{
		        		$push: {
		        			submissions: {submission: submission._id}
		        		}
		        	}
	        	)
			]).then(() => ({submission}));
		}),
	postReply: (_, {postReplyInput}) => Promise.all([Authentication(postReplyInput.token), SubmissionAPI.findOne({_id: postReplyInput.relatedSubmission})])
		.then(([user, submission]) => {
			const reply = new ReplyAPI({
				content: postReplyInput.content,
				submitted_by: user._id,
				submission: submission._id
			})
			return Promise.all([
				reply.save(),
				SubmissionAPI.updateOne(
		        	{ _id: challenge._id},
		        	{
		        		$push: {
		        			replies: {reply: reply._id}
		        		}
		        	}
	        	)
			]).then(() => ({reply}));
		}),
	markChallengeSolved: (_, {markChallengeSolvedInput}) => Promise.all([
		Authentication(markChallengeSolvedInput.token),
		ChallengeAPI.findOne({_id: markChallengeSolvedInput.challengeId}, CHALLENGE_FIELDS).populate('submitted_by', USER_FIELDS).populate('queue', QUEUE_FIELDS),
		SubmissionAPI.findOne({_id: markChallengeSolvedInput.submissionId}, SUBMISSION_FIELDS).populate('submitted_by', USER_FIELDS)
	]).then(([user, challenge, submission]) => {
		// in case of problems try mongoose equals method, prior to this shit had problems with strings
		// also migrate this if into models
		if (user._id !== challenge.submitted_by._id) {
			throw new Error('Fuck off not your problem biaach')
		}
		challenge.acceptSubmission(submission._id)

		const transaction = new Transaction({
			recipient: submission.submitted_by,
			queue: problem.queue,
			karma_value: 1,
			monetary_value: problem.boost_value,
			description: 'Correct solution reward form problem ' + problem._id
		})

		const winner = submission.submitted_by
		winner.addBalance(challenge.queue._id.toString(), transaction.karma_value)

		return Promise.all([transaction.save(), winner.save(), challenge.save()]).then(() => transaction);
	})

}

module.exports = {
	Challenge,
	Content,
	Queue,
	User,
	Submission,
	Transaction,
	Query,
	Mutation
}


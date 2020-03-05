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

const Mutation = {}
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


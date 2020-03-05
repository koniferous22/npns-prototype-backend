const Challenge = require('../../models/content/problem')
const Submission = require('../../models/content/submission')
const { Authentication } = require('../../middleware')
 
const { CHALLENGE_FIELDS, SUBMISSION_FIELDS, USER_FIELDS } = require('../utils/queryFields')

const markChallengeSolvedInput = `
	input MarkChallengeSolvedInput {
		token: String!
		challengeId: ID!
		submissionId: ID!
	}
`
const markChallengeSolvedPayload = `
	type MarkChallengeSolvedPayload {
		transaction: Transaction!
	}
`

const markChallengeSolved = (_, {markChallengeSolvedInput}) => Promise.all([
		Authentication(markChallengeSolvedInput.token),
		Challenge.findOne({_id: markChallengeSolvedInput.challengeId}, CHALLENGE_FIELDS).populate('submitted_by', USER_FIELDS).populate('queue', QUEUE_FIELDS),
		Submission.findOne({_id: markChallengeSolvedInput.submissionId}, SUBMISSION_FIELDS).populate('submitted_by', USER_FIELDS)
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

module.exports = {
	markChallengeSolvedInput,
	markChallengeSolvedPayload,
	markChallengeSolved
}

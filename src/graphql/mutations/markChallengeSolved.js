const { Challenge } = require('../types/Challenge')
const { Submission } = require('../types/Challenge/Submission')

const { authentication } = require('../../utils/authentication')

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

const markChallengeSolved = (_, { markChallengeSolvedInput }) => Promise.all([
		authentication(markChallengeSolvedInput.token),
		Challenge.findOne({_id: markChallengeSolvedInput.challengeId}).populate('submitted_by').populate('queue'),
		Submission.findOne({_id: markChallengeSolvedInput.submissionId}).populate('submitted_by')
	]).then(([user, challenge, submission]) => {
		// in case of challenges try mongoose equals method, prior to this shit had challenges with strings
		// also migrate this if into models
		if (user._id !== challenge.submitted_by._id) {
			throw new Error('Fuck off not your challenge biaach')
		}
		challenge.acceptSubmission(submission._id)

		// TODO for challenge poster, add update boost transaction metadata
		const karmaValue = 1
		// TODO populate submission poster
		let winner = submission.submitted_by
		winner.addTransaction('KOKOT', { from: 'NPNS_team.biz'}, challenge.bounty || 0, karmaValue, { relatedQueue: challenge.queue })
		winner.addBalance(challenge.queue, challenge.bounty, karmaValue)

		return Promise.all([transaction.save(), winner.save(), challenge.save()]).then(() => transaction);
	})

module.exports = {
	markChallengeSolvedInput,
	markChallengeSolvedPayload,
	markChallengeSolved
}

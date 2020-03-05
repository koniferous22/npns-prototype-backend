const Queue = require('../../models/queue')
const Challenge = require('../../models/content/problem')
const { Authentication } = require('../../middleware')

const postChallengeInput = `
	input PostChallengeInput {
		token: String!
		queueName: String!
		title: String!
		description: String!
	}
`
const postChallengePayload = `
	type PostChallengePayload {
		challenge: Challenge!
	}
`

const postChallenge = (_, {postChallengeInput}) => Promise.all([
		Authentication(postChallengeInput.token), 
		Queue.findOne({name: postChallengeInput.queueName})
	]).then(([user, queue]) => {
		const challenge = new Challenge({
			title: postChallengeInput.title,
			content: postChallengeInput.description,
			submitted_by: user._id,
			queue: queue._id

		})
		return challenge.save().then(() => ({challenge}));
	})

module.exports = {
	postChallengeInput,
	postChallengePayload,
	postChallenge
}

const Queue = require('../../models/queue')
const Challenge = require('../../models/post/challenge')
const { authentication } = require('../../utils/authentication')

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
		authentication(postChallengeInput.token), 
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

import { Queue } from '../types/Queue'
import { Challenge } from '../types/Challenge'
import { authentication } from '../../utils/authentication'

export const postChallengeInput = `
	input PostChallengeInput {
		token: String!
		queueName: String!
		title: String!
		description: String!
	}
`
export const postChallengePayload = `
	type PostChallengePayload {
		challenge: Challenge!
	}
`

export const postChallenge = (_, { postChallengeInput }) => Promise.all([
		authentication(postChallengeInput.token),
		Queue.findByName(postChallengeInput.queueName)
	]).then(([user, queue]) => {
		const challenge = new Challenge({
			title: postChallengeInput.title,
			content: postChallengeInput.description,
			submitted_by: user._id,
			queue: queue._id

		})
		return challenge.save().then(() => ({challenge}));
	})

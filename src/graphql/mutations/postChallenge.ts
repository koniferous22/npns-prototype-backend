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

export const postChallenge = async (_, { postChallengeInput }) => {
	const { token, queueName, title, description } = postChallengeInput
	const user = await authentication(token)
	const queue = await Queue.findByName(queueName)
	const challenge = Challenge.postChallenge(queue._id, user._id, title, description)
	await challenge.save()
	return {
		challenge
	}
}

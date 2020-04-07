import { Challenge } from '../types/Challenge'

import { authentication } from '../../utils/authentication'

export const postReplyInput = `
	input PostReplyInput {
		token: String!
		challenge :ID!
		submission: ID!
		content: String!
	}
`
export const postReplyPayload = `
	type PostReplyPayload {
		reply: Reply!
	}
`

export const postReply = async (_, { postReplyInput }) => {
	const user = await authentication(postReplyInput.token)
	const challenge = await Challenge.findById(postReplyInput.challenge)
	const submission = challenge.getSubmission(postReplyInput.submission)
	const reply = submission.postReply(user._id, postReplyInput.content)
	await challenge.save()
	return {
		reply
	}
}

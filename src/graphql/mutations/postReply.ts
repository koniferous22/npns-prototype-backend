import { Types } from 'mongoose'

import Challenge from '../models/Challenge'
import { ReplyType } from '../models/Challenge/Reply'

import { authentication } from '../../utils/authentication'

type PostReplyInputType = {
	token: string;
	challenge: Types.ObjectId;
	submission: Types.ObjectId;
	content: string;
}

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

export const postReply = async (_: void, { postReplyInput }: { postReplyInput: PostReplyInputType }) => {
	const user = await authentication(postReplyInput.token)
	const challenge = await Challenge.findChallengeById(postReplyInput.challenge)
	const submission = challenge.getSubmission(postReplyInput.submission)
	const reply = submission.postReply(user._id, postReplyInput.content)
	await challenge.save()
	return {
		reply
	}
}

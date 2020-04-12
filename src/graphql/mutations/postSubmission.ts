import { Types } from 'mongoose'

import { authentication } from '../../utils/authentication'

import Challenge from '../models/Challenge'

type PostSubmissionInputType = {
	token: string;
	challenge: Types.ObjectId;
	content: string;
}

export const postSubmissionInput = `
	input PostSubmissionInputType {
		token: String!
		challenge: ID!
		content: String!
	}
`
export const postSubmissionPayload = `
	type PostSubmissionPayload {
		submission: Submission!
	}
`

export const postSubmission = async (_: void, { postSubmissionInput }: { postSubmissionInput: PostSubmissionInputType }) => {
	const user = await authentication(postSubmissionInput.token)
	const challenge = await Challenge.findChallengeById(postSubmissionInput.challenge)
	const submission = challenge.postSubmission(user._id, postSubmissionInput.content)
	await challenge.save()
	return {
		submission
	}
}

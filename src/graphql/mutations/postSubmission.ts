import { authentication } from '../../utils/authentication'

import { Challenge } from '../types/Challenge'

export const postSubmissionInput = `
	input PostSubmissionInput {
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

export const postSubmission = async (_, { postSubmissionInput }) => {
	const user = await authentication(postSubmissionInput.token)
	const challenge = await Challenge.findById(postSubmissionInput.challenge)
	const submission = challenge.postSubmission(user._id, postSubmissionInput.content)
	await challenge.save()
	return {
		submission
	}
}

import { authentication } from '../../utils/authentication'
import { Challenge } from '../types/Challenge'
import { Submission } from '../types/Challenge/Submission'

export const postSubmissionInput = `
	input PostSubmissionInput {
		token: String!
		relatedChallenge: ID!
		content: String!
	}
`
export const postSubmissionPayload = `
	type PostSubmissionPayload {
		submission: Submission!
	}
`

export const postSubmission = (_, { postSubmissionInput }) => Promise.all([
		authentication(postSubmissionInput.token),
		Challenge.findOne({_id: postSubmissionInput.relatedChallenge})
	]).then(([user, challenge]) => {
		const submission = new Submission({
			content: postSubmissionInput.content,
			submitted_by: user._id,
			challenge: challenge._id
		})
		return Promise.all([
			submission.save(),
			Challenge.updateOne(
				{ _id: challenge._id},
				{
					$push: {
						submissions: {submission: submission._id}
					}
				}
			)
		]).then(() => ({submission}));
	})

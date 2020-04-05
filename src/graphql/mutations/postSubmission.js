const { authentication } = require('../../utils/authentication')
const { Challenge } = require('../types/Challenge')
const { Submission } = require('../types/Challenge/Submission')

const postSubmissionInput = `
	input PostSubmissionInput {
		token: String!
		relatedChallenge: ID!
		content: String!
	}
`
const postSubmissionPayload = `
	type PostSubmissionPayload {
		submission: Submission!
	}
`

const postSubmission = (_, { postSubmissionInput }) => Promise.all([
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

module.exports = {
	postSubmissionInput,
	postSubmissionPayload,
	postSubmission
}

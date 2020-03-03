const postReplyInput = `
	input PostReplyInput {
		token: String!
		relatedSubmission: ID!
		content: String!
	}
`

module.exports = postReplyInput

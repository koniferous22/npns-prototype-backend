const ReplySchema = `
	type Reply implements Content {
		# interface copy-paste
		id: ID!
		submittedBy: User!
		created: Date!
		active: Boolean!
		content: String!
		edits: [ContentEdit!]!
		attachmentUrls: [String!]!

		relatedSubmission: Submission!
	}
`

module.exports = ReplySchema

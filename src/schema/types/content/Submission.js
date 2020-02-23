const SubmissionSchema = `
	type Submission implements Content {
		# interface copy-paste
		id: ID!
		submittedBy: User!
		created: Date!
		active: Boolean!
		content: String!
		edits: [ContentEdit!]!
		attachmentUrls: [String!]!
		relatedChallenge: Challenge!
		replies: [Reply!]!
	}
`

module.exports = SubmissionSchema

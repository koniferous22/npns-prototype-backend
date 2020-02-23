const ChallengeSchema =`
	type Boost {
		boostValue: Float!
		boostedBy: User
		# payPalOrder: ???
	}

	type Challenge implements Content {
		# interface copy-paste
		id: ID!
		submittedBy: User!
		created: Date!
		active: Boolean!
		content: String!
		edits: [ContentEdit!]!
		attachmentUrls: [String!]!

		# end of interface copy-paste
		queue: Queue!
		rootQueueValue: Float! # wtf
		acceptedSubmission: Submission
		title: String!
		viewCount: Int!
		submissionPageCount(pageCount: Int): Int!
		submissions: [Submission!]!
		boosts: [Boost!]!
	}
`

module.exports = ChallengeSchema

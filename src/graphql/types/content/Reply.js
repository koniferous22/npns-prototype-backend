const { USER_FIELDS, SUBMISSION_FIELDS } = require('../../utils/queryFields')

const replySchema = `
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

const Reply = {
	submittedBy: async reply => (await reply.populate('submitted_by', USER_FIELDS).execPopulate()).submitted_by,
	relatedSubmission: async reply => (await reply.populate('submission', SUBMISSION_FIELDS).execPopulate()).submission
}


module.exports = {
	replySchema,
	Reply
}

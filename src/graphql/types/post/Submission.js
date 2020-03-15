const { USER_FIELDS, CHALLENGE_FIELDS, REPLY_FIELDS } = require('../../utils/queryFields')

const submissionSchema = `
	type Submission implements Post {
		# interface copy-paste
		id: ID!
		submittedBy: User!
		created: Date!
		active: Boolean!
		content: String!
		edits: [PostEdit!]!
		attachmentUrls: [String!]!
		relatedChallenge: Challenge!
		replies: [Reply!]!
	}
`
const Submission = {
	submittedBy: async submission => (await submission.populate('submitted_by', USER_FIELDS).execPopulate()).submitted_by,
	relatedChallenge: async submission => (await submission.populate('challenge', CHALLENGE_FIELDS).execPopulate()).challenge,
	replies: async submission => (await submission.populate('replies.reply', REPLY_FIELDS).execPopulate()).replies.map(r => r.reply)
}

module.exports = {
	submissionSchema,
	Submission
}

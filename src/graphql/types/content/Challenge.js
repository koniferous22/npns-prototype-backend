const Submission = require('../../../models/content/submission')
const Reply = require('../../../models/content/reply')

const { QUEUE_FIELDS, USER_FIELDS, SUBMISSION_FIELDS } = require('../../utils/queryFields')

const challengeSchema =`
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

const Challenge = {
	rootQueueValue: challenge => challenge.root_queue_value,
	submissionPageCount: (challenge, {pageSize = 50}) => Math.floor(challenge.submissions.length / pageSize) + (challenge.submissions.length % pageSize > 0 ? 1 : 0),
	submissions: async challenge => (await challenge.populate('submissions.submission', SUBMISSION_FIELDS).execPopulate()).submissions.map(s => s.submission),
	submittedBy: async challenge => (await challenge.populate('submitted_by', USER_FIELDS).execPopulate()).submitted_by,
	queue: async content => (await content.populate('queue', QUEUE_FIELDS).execPopulate()).queue,
	viewCount: challenge => challenge.view_count
}


module.exports = {
	challengeSchema,
	Challenge
}

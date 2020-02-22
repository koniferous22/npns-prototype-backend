const { USER_FIELDS, SUBMISSION_FIELDS } = require('../constants')

const SubmissionAPI = require('../../models/content/submission')
const ReplyAPI = require('../../models/content/reply')

const Challenge = {
	rootQueueValue: challenge => challenge.root_queue_value,
	submissionPageCount: (challenge, {pageSize = 50}) => Math.floor(challenge.submissions.length / pageSize) + (challenge.submissions.length % pageSize > 0 ? 1 : 0),
	submissions: async challenge => (await challenge.populate('submissions.submission', SUBMISSION_FIELDS).execPopulate()).submissions.map(s => s.submission),
	submittedBy: async challenge => (await challenge.populate('submitted_by', USER_FIELDS).execPopulate()).submitted_by,
	viewCount: challenge => challenge.view_count
}

module.exports = Challenge

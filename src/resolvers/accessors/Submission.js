const { USER_FIELDS, CHALLENGE_FIELDS, REPLY_FIELDS } = require('../constants')

const Submission = {
	submittedBy: async submission => (await submission.populate('submitted_by', USER_FIELDS).execPopulate()).submitted_by,
	relatedChallenge: async submission => (await submission.populate('problem', CHALLENGE_FIELDS).execPopulate()).problem,
	replies: async submission => (await submission.populate('replies.reply', REPLY_FIELDS).execPopulate()).replies.map(r => r.reply)
}

module.exports = Submission

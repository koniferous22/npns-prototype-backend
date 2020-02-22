const { USER_FIELDS, SUBMISSION_FIELDS } = require('../constants')

const Submission = {
	submittedBy: async reply => (await reply.populate('submitted_by', USER_FIELDS).execPopulate()).submitted_by,
	relatedSubmission: async reply => (await reply.populate('submission', SUBMISSION_FIELDS).execPopulate()).submission
}

module.exports = Submission

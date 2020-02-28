const QueueAPI = require('../../models/queue')
const { QUEUE_FIELDS } = require('../constants')

const temporaryTranslationTable = {
	Problem: "Challenge"
}

const Content = {
	__resolveType: content => content.__t in temporaryTranslationTable ? temporaryTranslationTable[content.__t] : content.__t,
	submittedBy: async content => (await content.populate('submitted_by', USER_FIELDS).execPopulate()).submitted_by
}

module.exports = Content

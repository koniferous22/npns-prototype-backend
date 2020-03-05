const { USER_FIELDS } = require('../../utils/queryFields')

const contentSchema = `interface Content {
	id: ID!
	submittedBy: User!
	created: Date!
	active: Boolean!
	content: String!
	#edits: [ContentEdit!]!
	attachmentUrls: [String!]!
}`

// TODO: remove
const temporaryTranslationTable = {
	Problem: "Challenge"
}

const Content = {
	__resolveType: content => content.__t in temporaryTranslationTable ? temporaryTranslationTable[content.__t] : content.__t,
	submittedBy: async content => (await content.populate('submitted_by', USER_FIELDS).execPopulate()).submitted_by
}


module.exports = {
	contentSchema,
	Content
}

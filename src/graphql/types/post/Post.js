const { USER_FIELDS } = require('../../utils/queryFields')

const postSchema = `interface Post {
	id: ID!
	submittedBy: User!
	created: Date!
	active: Boolean!
	content: String!
	#edits: [PostEdit!]!
	attachmentUrls: [String!]!
}`

// TODO: remove
const temporaryTranslationTable = {
	Problem: "Challenge"
}

const Post = {
	__resolveType: post => post.__t in temporaryTranslationTable ? temporaryTranslationTable[post.__t] : post.__t,
	submittedBy: async post => (await post.populate('submitted_by', USER_FIELDS).execPopulate()).submitted_by
}


module.exports = {
	postSchema,
	Post
}

const mongoose = require('mongoose')

const ContentMetaDbSchema = new mongoose.Schema({
	submittedBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	createdAt: {
		type: Date,
		default: Date.now,
		index: true,
		max: Date.now
	},
	isActive: {
		type: Boolean,
		default: true
	},
	content: {
		type: String,
		required: true
	},
	attachmentUrls: [{
		type: String
	}]
})

const ContentMetaSchema = `
	type ContentMeta {
		submittedBy: User!
		createdAt: Date!
		isActive: Boolean!
		content: String!
		attachmentUrls: [String!]!
	}
`

const ContentMetaResolvers = {
	submittedBy: async (contentMeta) => (await contentMeta.populate('submittedBy')).submittedBy
}

module.exports = {
	ContentMetaDbSchema,
	ContentMetaSchema,
	ContentMetaResolvers
}

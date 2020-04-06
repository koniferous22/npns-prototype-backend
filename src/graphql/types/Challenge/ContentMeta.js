import mongoose  from 'mongoose'
import {
	TimestampSchemaTypeCreator
} from '../utils/schemaTypeCreators'

export const ContentMetaDbSchema = new mongoose.Schema({
	submittedBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	createdAt: TimestampSchemaTypeCreator(),
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

export const ContentMetaSchema = `
	type ContentMeta {
		submittedBy: User!
		createdAt: Date!
		isActive: Boolean!
		content: String!
		attachmentUrls: [String!]!
	}
`

export const ContentMetaResolvers = {
	submittedBy: async (contentMeta) => (await contentMeta.populate('submittedBy')).submittedBy
}

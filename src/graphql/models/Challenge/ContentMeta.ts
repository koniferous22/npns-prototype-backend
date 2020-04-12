import mongoose from 'mongoose'
import {
	TimestampSchemaTypeCreator
} from '../../utils/subSchemaCreators'

export interface ContentMetaType extends mongoose.Types.Subdocument {
	submittedBy: mongoose.Types.ObjectId;
	content: string;
	createdAt: Date;
	isActive: boolean;
	attachmentUrls?: string[];
}

const ContentMetaDbSchema = new mongoose.Schema({
	submittedBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	content: {
		type: String,
		required: true
	},
	createdAt: TimestampSchemaTypeCreator(),
	isActive: {
		type: Boolean,
		default: true
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
	submittedBy: async (contentMeta: ContentMetaType) => (await contentMeta.populate('submittedBy')).submittedBy
}

export {
	ContentMetaDbSchema
}
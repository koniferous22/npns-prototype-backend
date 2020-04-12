import mongoose  from 'mongoose'

import { ContentMetaDbSchema, ContentMetaSchema, ContentMetaType } from './ContentMeta'

export interface EditType extends mongoose.Types.Subdocument {
	contentMeta: ContentMetaType;
}

export const EditDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
})

export const EditSchema = `
	type Edit {
		contentMeta: ContentMeta!
	}
`

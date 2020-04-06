import mongoose  from 'mongoose'

import { ContentMetaDbSchema, ContentMetaSchema } from './ContentMeta'

export const EditDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
})

export const EditSchema = `
	type Edit {
		contentMeta: ContentMeta!
	}
`

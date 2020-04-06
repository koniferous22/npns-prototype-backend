import mongoose  from 'mongoose'

import { ContentMetaDbSchema } from './ContentMeta'
import { EditDbSchema } from './Edit'

export const ReplyDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
	edits: [EditDbSchema]
})

// ? related challenge
export const ReplySchema = `
	type Reply {
		contentMeta: ContentMeta!
		edits: [Edit!]!
	}
`

import mongoose  from 'mongoose'

import { ContentMetaDbSchema } from './ContentMeta'
import { EditDbSchema } from './Edit'
import { ReplyDbSchema } from './Reply'

export const SubmissionDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
	edits: [EditDbSchema],
	replies: [ReplyDbSchema]
})

// RELATED CHALLENGE

export const SubmissionSchema = `
	type Submission {
		contentMeta: ContentMeta!
		edits: [Edit!]!
		replies: [Reply!]!
	}
`

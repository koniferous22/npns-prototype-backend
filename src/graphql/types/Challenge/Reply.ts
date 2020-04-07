import mongoose  from 'mongoose'

import { ContentMetaDbSchema } from './ContentMeta'
import { EditDbSchema } from './Edit'

const ReplyDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
	edits: [EditDbSchema]
})

ReplyDbSchema.methods.getEdit = function (editId) {
	return this.edits.id(editId)
}

ReplyDbSchema.methods.postEdit = function (submittedBy, content) {
	const newEdit = this.edits.create({
		contentMeta: {
			submittedBy,
			content	
		}
	})
	this.edits.push(newEdit);
	return newEdit
}


// ? related challenge
export const ReplySchema = `
	type Reply {
		contentMeta: ContentMeta!
		edits: [Edit!]!
	}
`

export {
	ReplyDbSchema
}
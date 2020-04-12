import mongoose, { Types }  from 'mongoose'

import { ContentMetaDbSchema, ContentMetaType } from './ContentMeta'
import { EditDbSchema, EditType } from './Edit'

export interface ReplyType extends mongoose.Types.Subdocument {
	contentMeta: ContentMetaType;
	edits: EditType[];

	getEdit(editId: Types.ObjectId): EditType;
	postEdit(submittedBy: Types.ObjectId, content: string): EditType;
}

const ReplyDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
	edits: [EditDbSchema]
})

ReplyDbSchema.methods.getEdit = function (editId: Types.ObjectId) {
	return this.edits.id(editId)
}

ReplyDbSchema.methods.postEdit = function (submittedBy: Types.ObjectId, content: string) {
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
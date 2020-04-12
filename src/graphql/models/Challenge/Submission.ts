import mongoose, { Types }  from 'mongoose'

import { ContentMetaDbSchema, ContentMetaType } from './ContentMeta'
import { EditDbSchema, EditType } from './Edit'
import { ReplyDbSchema, ReplyType } from './Reply'

export interface SubmissionType extends mongoose.Types.Subdocument {
	contentMeta: ContentMetaType;
	edits: EditType[];
	replies: ReplyType[];

	getReply(replyId: Types.ObjectId): ReplyType;
	postReply(submittedBy: Types.ObjectId, content: string): ReplyType;
	getEdit(editId: Types.ObjectId): EditType;
	postEdit(submittedBy: Types.ObjectId, content: string): EditType;
}

const SubmissionDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
	edits: [EditDbSchema],
	replies: [ReplyDbSchema]
})

SubmissionDbSchema.methods.getEdit = function (editId: Types.ObjectId) {
	return this.edits.id(editId)
}

SubmissionDbSchema.methods.postEdit = function (submittedBy: Types.ObjectId, content: string) {
	const newEdit = this.edits.create({
		contentMeta: {
			submittedBy,
			content	
		}
	})
	this.edits.push(newEdit);
	return newEdit
}

SubmissionDbSchema.methods.getReply = function (replyId: Types.ObjectId) {
	return this.replies.id(replyId)
}

SubmissionDbSchema.methods.postReply = function (submittedBy: Types.ObjectId, content: string) {
	const newReply = this.replies.create({
		contentMeta: {
			submittedBy,
			content
		}
	})
	this.replies.push(newReply)
	return newReply
}

export const SubmissionSchema = `
	type Submission {
		contentMeta: ContentMeta!
		edits: [Edit!]!
		replies: [Reply!]!
	}
`

export {
	SubmissionDbSchema
}

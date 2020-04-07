import mongoose  from 'mongoose'

import { ContentMetaDbSchema } from './ContentMeta'
import { EditDbSchema } from './Edit'
import { ReplyDbSchema } from './Reply'

const SubmissionDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
	edits: [EditDbSchema],
	replies: [ReplyDbSchema]
})

SubmissionDbSchema.methods.getEdit = function (editId) {
	return this.edits.id(editId)
}

SubmissionDbSchema.methods.postEdit = function (submittedBy, content) {
	const newEdit = this.edits.create({
		contentMeta: {
			submittedBy,
			content	
		}
	})
	this.edits.push(newEdit);
	return newEdit
}

SubmissionDbSchema.methods.getReply = function (replyId) {
	return this.replies.id(replyId)
}

SubmissionDbSchema.methods.postReply = function (submittedBy, content) {
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

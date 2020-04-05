const mongoose = require('mongoose')

const { ContentMetaDbSchema } = require('./ContentMeta')
const { EditDbSchema } = require('./Edit')
const { ReplyDbSchema } = require('./Reply')

const SubmissionDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
	edits: [EditDbSchema],
	replies: [ReplyDbSchema]
})

// RELATED CHALLENGE

const SubmissionSchema = `
	type Submission {
		contentMeta: ContentMeta!
		edits: [Edit!]!
		replies: [Reply!]!
	}
`

module.exports = {
	SubmissionDbSchema,
	SubmissionSchema
}

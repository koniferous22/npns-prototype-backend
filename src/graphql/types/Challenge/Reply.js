const mongoose = require('mongoose')

const { ContentMetaDbSchema } = require('./ContentMeta')
const { EditDbSchema } = require('./Edit')

const ReplyDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
	edits: [EditDbSchema]
})

// ? related challenge
const ReplySchema = `
	type Reply {
		contentMeta: ContentMeta!
		edits: [Edit!]!
	}
`

module.exports = {
	ReplyDbSchema,
	ReplySchema
}

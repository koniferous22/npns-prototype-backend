const mongoose = require('mongoose')

const { ContentMetaDbSchema, ContentMetaSchema } = require('./ContentMeta')

const EditDbSchema = new mongoose.Schema({
	contentMeta: ContentMetaDbSchema,
})

const EditSchema = `
	type Edit {
		contentMeta: ContentMeta!
	}
`

module.exports = {
	EditDbSchema,
	EditSchema
}

const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
	submitted_by: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
		index: true
	},
	created: {
		type: Date,
		default: Date.now,
		index: true,
		max: Date.now
	},
	active: {
		type: Boolean,
		default: true
	},
	content: {
		type: String,
		required: true
	},
	edits: [{
		contents: {
			type: String,
			required: true
		},
		edited: {
			type: Date,
			default: Date.now,
			max: Date.now
		},
		_id: false
	}],
	attachmentUrls: [{
		type: String
	}]
})

PostSchema.methods.edit = function (contents) {
	this.edits.push({contents})
}

const PostModel = mongoose.model('Post', PostSchema, 'Post');

module.exports = PostModel

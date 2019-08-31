const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
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
	}]
})

ContentSchema.methods.edit = function (contents) {
	this.edits.push({contents})
}

const ContentModel = mongoose.model('Content', ContentSchema, 'Content');

module.exports = ContentModel
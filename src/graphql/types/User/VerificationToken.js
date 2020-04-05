const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const USERNAME_UPDATE = 'USER_UPDATE_USERNAME'
const PASSWORD_RESET = 'USER_PASSWORD_RESET'
const EMAIL_UPDATE = 'USER_UPDATE_EMAIL'

const {
	EmailSchemaTypeCreator
} = require('../utils/schemaTypeCreators')

const VerificationTokenDbSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: [USERNAME_UPDATE, PASSWORD_RESET, EMAIL_UPDATE],
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	token: {
    	type: String,
    	required: true,
    	default: function() {
    		return crypto.randomBytes(16).toString('hex')
    	}
    },
	createdAt: {
		type: Date,
		default: Date.now,
		index: true,
		max: Date.now
	},
	payload: {
		userUpdate: {
			newUsername: {
				type: String,
				required: () => this.type === USERNAME_UPDATE
			},
			newEmail: EmailSchemaTypeCreator(
				function() {
					this.type === EMAIL_UPDATE
				},
				false
			)
		}
	}

})

const VerificationToken = mongoose.model('VerificationToken', VerificationTokenDbSchema, 'VerificationToken')

module.exports = {
	VerificationToken
}
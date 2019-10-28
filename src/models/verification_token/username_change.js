const mongoose = require('mongoose');

const options = {
	discriminatorKey: 'kind'
}

const VerificationTokenModel = require('./verification_token');

const UsernameChangeTokenSchema = new mongoose.Schema({
	newUsername: {
		type: String,
		trim: true
	}
})


const UsernameChangeTokenModel = VerificationTokenModel.discriminator('UsernameChange', UsernameChangeTokenSchema, options)

module.exports = UsernameChangeTokenModel
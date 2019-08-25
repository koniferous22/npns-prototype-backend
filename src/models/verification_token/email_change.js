const mongoose = require('mongoose');

const options = {
	discriminatorKey: 'kind'
}

const VerificationTokenModel = require('./verification_token');

const EmailChangeTokenSchema = new mongoose.Schema({
	newEmail: require('../constraints/email')
})


const EmailChangeTokenModel = VerificationTokenModel.discriminator('EmailChange', EmailChangeTokenSchema, options)

module.exports = EmailChangeTokenModel
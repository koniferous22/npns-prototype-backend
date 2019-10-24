const mongoose = require('mongoose');

const options = {
	discriminatorKey: 'kind'
}

const VerificationTokenModel = require('./verification_token');

const PasswordResetTokenSchema = new mongoose.Schema({})

const PasswordResetTokenModel = VerificationTokenModel.discriminator('PasswordReset', PasswordResetTokenSchema, options)

module.exports = PasswordResetTokenModel
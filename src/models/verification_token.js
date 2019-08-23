const mongoose = require('mongoose');
const crypto = require('crypto')
const user = require('./user')

const VerificationTokenSchema = new mongoose.Schema({
    userId: {
    	type: mongoose.Schema.Types.ObjectId,
    	required: true,
    	ref: 'User',
        unique: true
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
    	required: true,
    	default: Date.now,
    	expires: 43200 // equals 12 hourz
    }
});

VerificationTokenSchema.static.verifyUserEmail = async function(tokenToVerify) {
    // TODO
}

const VerificationTokenModel = mongoose.model('VerificationToken', VerificationTokenSchema, 'VerificationToken')

module.exports = VerificationTokenModel
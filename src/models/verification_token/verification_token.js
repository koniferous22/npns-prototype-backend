const mongoose = require('mongoose');
const crypto = require('crypto')

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


const VerificationTokenModel = mongoose.model('VerificationToken', VerificationTokenSchema, 'VerificationToken')

module.exports = VerificationTokenModel
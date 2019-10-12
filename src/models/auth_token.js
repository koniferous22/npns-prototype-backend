const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const AuthTokenSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	token: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	created_at: {
    	type: Date,
    	default: Date.now,
    	expires: '20m'
    }
})

AuthTokenSchema.statics.generate = async function (user) {
	const token = jwt.sign({_id: user}, process.env.JWT_KEY)
    const auth_token_record = new this({ token, user })
    await auth_token_record.save()
    return auth_token_record
}

AuthTokenModel = mongoose.model('AuthToken', AuthTokenSchema, 'AuthToken')
module.exports = AuthTokenModel
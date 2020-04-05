const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const AuthTokenDbSchema = new mongoose.Schema({
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
	createdAt: {
    	type: Date,
    	default: Date.now,
    	expires: 12000
    }
})

AuthTokenDbSchema.statics.generate = async function (user) {
	const token = jwt.sign({_id: user}, process.env.JWT_KEY)
	const authTokenRecord = new this({ token, user })
	await authTokenRecord.save()
	return authTokenRecord	
}
AuthTokenDbSchema.statics.findRecord = function (token) {
	return this.findOne({ token })
}
AuthTokenDbSchema.statics.deleteToken = function (token) {
	return this.deleteOne({ token })
}
AuthTokenDbSchema.statics.deleteAllBy = function ({ _id: user }) {
	return this.deleteMany({ user })
}

AuthToken = mongoose.model('AuthToken', AuthTokenDbSchema, 'AuthToken')

module.exports = {
	AuthToken
}

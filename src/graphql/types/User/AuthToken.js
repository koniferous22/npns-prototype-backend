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
		unique: true,
		index: true,
		default: function() {
			return jwt.sign({_id: this.user}, process.env.JWT_KEY)
		} 
	},
	createdAt: {
    	type: Date,
    	default: Date.now,
    	expires: 12000
    }
})

AuthTokenDbSchema.statics.generate = async function (user) {
	const authTokenRecord = new this({ user })
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

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

AuthTokenModel = mongoose.model('AuthToken', AuthTokenDbSchema, 'AuthToken')

AuthTokenMethods = {
	generate: async (user) => {
		const token = jwt.sign({_id: user}, process.env.JWT_KEY)
    	const authTokenRecord = new this({ token, user })
    	await authTokenRecord.save()
    	return authTokenRecord	
	},
	findRecord: (token) => AuthTokenModel.findOne({ token }),
	deleteToken: (token) => AuthTokenModel.deleteOne({ token }),
	deleteAllBy: ({ _id: user }) => AuthToken.deleteMany({ user }),
}

module.exports = {
	AuthTokenMethods
}

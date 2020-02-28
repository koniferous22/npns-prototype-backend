const jwt = require('jsonwebtoken')
const User = require('../models/user')
const AuthToken = require('../models/auth_token')

const { USER_FIELDS } = require('../resolvers/constants')

const authentication = token => new Promise((resolve, reject) => {
    const data = jwt.verify(token, process.env.JWT_KEY)
	return AuthToken.findOne({token}).then(tokenRecord => {
		if (!tokenRecord) {
			return reject(new Error("Invalid token"));
		}
		return tokenRecord.populate('user', USER_FIELDS).execPopulate()
	}).then(populatedTokenRecord => {
		if (!populatedTokenRecord) {
			return reject(new Error('User not found'))
		}
		return resolve(populatedTokenRecord.user)
	}).catch(error => {
		return reject(error)
	})
})

module.exports = authentication

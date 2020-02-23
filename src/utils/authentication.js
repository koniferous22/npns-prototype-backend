const jwt = require('jsonwebtoken')
const User = require('./models/user')
const AuthToken = require('./models/auth_token')

const { USER_FIELDS } = require('../resolvers/constants')

const authentication = new Promise((resolve, reject) => {
	const token = req.header('Authorization').replace('Bearer ', '')
    const data = jwt.verify(token, process.env.JWT_KEY)
	return AuthToken.findOne({token}).then(tokenRecord => {
		if (!tokenRecord) {
			throw new Error("Invalid token")
		}
		return tokenRecord.populate('user', USER_FIELDS).execPopulate()
	}).then(populatedTokenRecord => {
		if (!populatedTokenRecord) {
			throw new Error('User not found')
		}
		return populatedTokenRecord.user
	}).catch(error => {
		reject(error)
	})
})

module.exports = authentication

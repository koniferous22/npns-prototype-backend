const jwt = require('jsonwebtoken')
const { AuthTokenMethods } = require('../graphql/types/AuthToken')

const { USER_FIELDS } = require('../graphql/utils/queryFields')
// TODO migrate as user method somehow
const authentication = token => new Promise((resolve, reject) => {
    const data = jwt.verify(token, process.env.JWT_KEY)
	return AuthTokenMethods.findRecord(token).then(tokenRecord => {
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

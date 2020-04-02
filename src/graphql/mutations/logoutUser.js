const { AuthTokenMethods } = require('../types/AuthToken')
const { authentication } = require('../../utils/authentication')

const logoutUser = (_, { logoutInput }) => authentication(logoutInput.token)
	.then(() => AuthTokenMethods.deleteToken(logoutInput.token))
	.then(() => ({message: 'Logged out!'}))

module.exports = {
	logoutUser
}
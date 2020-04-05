const { AuthToken } = require('../types/User/AuthToken')
const { authentication } = require('../../utils/authentication')

const logoutUser = (_, { logoutInput }) => authentication(logoutInput.token)
	.then(() => AuthToken.deleteToken(logoutInput.token))
	.then(() => ({message: 'Logged out!'}))

module.exports = {
	logoutUser
}
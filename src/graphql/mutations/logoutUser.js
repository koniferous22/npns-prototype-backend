const AuthToken = require('../../models/auth_token')
const { authentication } = require('../../utils/authentication')

const logoutUser = (_, { logoutInput }) => authentication(logoutInput.token)
	.then(() => AuthToken.deleteOne({token: logoutInput.token}))
	.then(() => ({message: 'Logged out!'}))

module.exports = {
	logoutUser
}
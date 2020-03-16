const AuthToken = require('../../models/auth_token')
const { authentication } = require('../../utils/authentication')

const logoutUserAllDevices = (_, { logoutInput }) => authentication(logoutInput.token)
	.then(user => AuthToken.deleteMany({user: user._id}))
	.then(() => ({message: 'Logged out!'}))

module.exports = {
	logoutUserAllDevices
}

const AuthToken = require('../../models/auth_token')
const { Authentication } = require('../../middleware')

const logoutUserAllDevices = (_, {logoutInput}) => Authentication(logoutInput.token)
	.then(user => AuthToken.deleteMany({user: user._id}))
	.then(() => ({message: 'Logged out!'}))

module.exports = {
	logoutUserAllDevices
}

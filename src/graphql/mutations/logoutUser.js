const AuthToken = require('../../models/auth_token')
const { Authentication } = require('../../middleware')

const logoutUser = (_, {logoutInput}) => Authentication(logoutInput.token)
	.then(() => AuthToken.deleteOne({token: logoutInput.token}))
	.then(() => ({message: 'Logged out!'}))

module.exports = {
	logoutUser
}
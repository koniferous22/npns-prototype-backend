const { AuthToken } = require('../types/User/AuthToken')
const { authentication } = require('../../utils/authentication')

const logoutUserAllDevices = (_, { logoutInput }) => authentication(logoutInput.token)
	.then(user => AuthToken.deleteAllBY(user))
	.then(() => ({message: 'Logged out!'}))

module.exports = {
	logoutUserAllDevices
}

const { AuthTokenMethods } = require('../types/AuthToken')
const { authentication } = require('../../utils/authentication')

const logoutUserAllDevices = (_, { logoutInput }) => authentication(logoutInput.token)
	.then(user => AuthTokenMethods.deleteAllBY(user))
	.then(() => ({message: 'Logged out!'}))

module.exports = {
	logoutUserAllDevices
}

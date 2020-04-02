const { AuthTokenModel } = require('../types/AuthToken')
const { authentication } = require('../../utils/authentication')

const logoutUserAllDevices = (_, { logoutInput }) => authentication(logoutInput.token)
	.then(user => AuthTokenModel.deleteAllBY(user))
	.then(() => ({message: 'Logged out!'}))

module.exports = {
	logoutUserAllDevices
}

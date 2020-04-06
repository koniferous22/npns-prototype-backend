import { AuthToken } from '../types/User/AuthToken'
import { authentication } from '../../utils/authentication'

export const logoutUserAllDevices = (_, { logoutInput }) => authentication(logoutInput.token)
	.then(user => AuthToken.deleteAllBY(user))
	.then(() => ({message: 'Logged out!'}))

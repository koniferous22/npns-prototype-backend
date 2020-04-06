import { AuthToken } from '../types/User/AuthToken'
import { authentication } from '../../utils/authentication'

export const logoutUser = (_, { logoutInput }) => authentication(logoutInput.token)
	.then(() => AuthToken.deleteToken(logoutInput.token))
	.then(() => ({message: 'Logged out!'}))

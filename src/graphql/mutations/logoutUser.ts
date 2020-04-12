import AuthToken from '../models/User/AuthToken'
import { authentication } from '../../utils/authentication'
import { TokenInputType } from '../utils/types'

export const logoutUser = async (_: void, { logoutInput }: { logoutInput: TokenInputType }) => {
	await authentication(logoutInput.token)
	await AuthToken.deleteToken(logoutInput.token)
	return 'Logged out!'
}

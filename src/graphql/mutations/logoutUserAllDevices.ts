import AuthToken from '../models/User/AuthToken'
import { authentication } from '../../utils/authentication'
import { TokenInputType } from '../utils/types'

export const logoutUserAllDevices = async (_: void, { logoutInput }: {logoutInput: TokenInputType}) => {
	const user = await authentication(logoutInput.token)
	await AuthToken.deleteAllBy(user._id)
	return 'Logged out!'
}

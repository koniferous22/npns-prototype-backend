import { authentication } from '../../utils/authentication'
import { TokenInputType } from '../utils/types'

export const keepAlivePayload = `
	type KeepAlivePayload {
		token: String!
		user: User!
	}
`

export const keepAlive = async (_: void, { keepAliveInput }: { keepAliveInput: TokenInputType } ) => {
	const { token } = keepAliveInput
	const user = await authentication(keepAliveInput.token)
	return {
		token,
		user
	}
}

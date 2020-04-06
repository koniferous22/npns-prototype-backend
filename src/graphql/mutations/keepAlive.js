import { authentication } from '../../utils/authentication'

export const keepAlivePayload = `
	type KeepAlivePayload {
		token: String!
		user: User!
	}
`

export const keepAlive = async (_, { keepAliveInput }) => authentication(keepAliveInput.token).then((user) => ({
	token,
	user
}))

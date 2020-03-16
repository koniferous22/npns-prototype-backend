const { authentication } = require('../../utils/authentication')

const keepAlivePayload = `
	type KeepAlivePayload {
		token: String!
		user: User!
	}
`

const keepAlive = async (_, { keepAliveInput }) => authentication(keepAliveInput.token).then((user) => ({
	token,
	user
}))

module.exports = {
	keepAlivePayload,
	keepAlive
}

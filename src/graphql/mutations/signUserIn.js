const User = require('../../models/user')
const AuthToken = require('../../models/auth_token')

const signUserInInput = `
	input SignUserInInput {
		identifier: String!
		password: String!
	}
`

const signUserInPayload = `
	type SignUserInPayload {
		user: User!
		token: String!
	}
`

const signUserIn = (_, { signUserInInput }) => User.find().byCredentials(signUserInInput.identifier, signUserInInput.password).then(user => {
	if (!user) {
		throw new Error('Login failed! Check authentication credentials')
	}
	if (!user.verified) {
		throw new Error('not verified, check your email')
	}
	return AuthToken.generate(user._id).then(token => ({
		user,
		token: token.token
	}))
})

module.exports = {
	signUserInInput,
	signUserInPayload,
	signUserIn
}

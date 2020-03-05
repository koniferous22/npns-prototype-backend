const User = require('../../models/user')
const AuthToken = require('../../models/auth_token')

const signInUserInput = `
	input SignInUserInput {
		identifier: String!
		password: String!
	}
`

const signInUserPayload = `
	type SignInUserPayload {
		user: User!
		token: String!
	}
`

const signInUser = (_, {signInUserInput}) => User.find().byCredentials(signInUserInput.identifier, signInUserInput.password).then(user => {
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
	signInUserInput,
	signInUserPayload,
	signInUser
}

const { UserMethods } = require('../types/User');
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

const signUserIn = async (_, { signUserInInput }) => {
	const { identifier, password } = signUserInInput;
	const user = await UserMethods.findByIdentifier(identifier, password);
	console.log(JSON.stringify(user));
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
}

module.exports = {
	signUserInInput,
	signUserInPayload,
	signUserIn
}

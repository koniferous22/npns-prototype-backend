const { UserMethods } = require('../types/User');
const { AuthTokenMethods } = require('../types/AuthToken');

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
	if (!user) {
		throw new Error('Login failed! Check authentication credentials')
	}
	if (!user.verified) {
		throw new Error('not verified, check your email')
	}
	const { token } = await AuthTokenMethods.generate(user);
	return {
		user,
		token
	};
}

module.exports = {
	signUserInInput,
	signUserInPayload,
	signUserIn
}

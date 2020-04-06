import { User } from '../types/User';
import { AuthToken } from '../types/User/AuthToken';

export const signUserInInput = `
	input SignUserInInput {
		identifier: String!
		password: String!
	}
`

export const signUserInPayload = `
	type SignUserInPayload {
		user: User!
		token: String!
	}
`

export const signUserIn = async (_, { signUserInInput }) => {
	const { identifier, password } = signUserInInput;
	const user = await User.findByIdentifier(identifier, password);
	if (!user) {
		throw new Error('Login failed! Check authentication credentials')
	}
	if (!user.verified) {
		throw new Error('not verified, check your email')
	}
	const { token } = await AuthToken.generate(user);
	return {
		user,
		token
	};
}

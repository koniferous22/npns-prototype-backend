import User, { UserType } from '../models/User';
import AuthToken from '../models/User/AuthToken';

type SignUserInInputType = {
	identifier: string;
	password: string;
}

export const signUserInInput = `
	input SignUserInInput {
		identifier: String!
		password: String!
	}
`

type SignUserInPayload = {
	user: UserType;
	token: string;
}

export const signUserInPayload = `
	type SignUserInPayload {
		user: User!
		token: String!
	}
`

export const signUserIn = async (_: void, { signUserInInput }: { signUserInInput: SignUserInInputType }): Promise<SignUserInPayload> => {
	const { identifier, password } = signUserInInput;
	const user = await User.signIn(identifier, password);
	if (!user) {
		throw new Error('Login failed! Check authentication credentials')
	}
	if (!user.verified) {
		throw new Error('not verified, check your email')
	}
	const { token } = await AuthToken.generate(user.id);
	return {
		user,
		token
	};
}

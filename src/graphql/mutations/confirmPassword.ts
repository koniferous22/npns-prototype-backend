import { authentication } from '../../utils/authentication'

interface ConfirmPasswordInputType {
	token: string;
	password: string;
}

export const confirmPasswordInput = `
	input ConfirmPasswordInput {
		token: String!
		password: String!
	}
`
export const confirmPassword = async (_: void, { confirmPasswordInput }: { confirmPasswordInput: ConfirmPasswordInputType }) => {
	const user = await authentication(confirmPasswordInput.token)
	const isPasswordValid = await user.isPasswordValid(confirmPasswordInput.password)
	return 'Password valid'
}

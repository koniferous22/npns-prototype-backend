import { authentication } from '../../utils/authentication'

export const confirmPasswordInput = `
	input ConfirmPasswordInput {
		token: String!
		password: String!
	}
`
export const confirmPassword = (_, { confirmPasswordInput }) => authentication(confirmPasswordInput.token)
	.then(user => {
		return user.validPassword(confirmPasswordInput.password)
	})
	.then(() => {
		return ({message: 'Password valid'})
	})

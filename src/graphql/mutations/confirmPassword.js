const { authentication } = require('../../utils/authentication')

const confirmPasswordInput = `
	input ConfirmPasswordInput {
		token: String!
		password: String!
	}
`
const confirmPassword = (_, { confirmPasswordInput }) => authentication(confirmPasswordInput.token)
	.then(user => {
		return user.validPassword(confirmPasswordInput.password)
	})
	.then(() => {
		return ({message: 'Password valid'})
	})

module.exports = {
	confirmPasswordInput,
	confirmPassword
}

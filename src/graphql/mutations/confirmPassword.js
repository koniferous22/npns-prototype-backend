const { Authentication } = require('../../middleware')

const confirmPasswordInput = `
	input ConfirmPasswordInput {
		token: String!
		password: String!
	}
`
const confirmPassword = (_, {confirmPasswordInput}) => Authentication(confirmPasswordInput.token)
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

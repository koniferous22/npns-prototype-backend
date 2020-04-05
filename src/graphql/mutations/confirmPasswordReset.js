const { AuthToken } = require('../types/User/AuthToken')

const VerificationToken = require('../types/User/VerificationToken')

const confirmPasswordResetInput = `
	input ConfirmPasswordResetInput {
		emailToken: String!,
		newPassword: String!
	}
`

const confirmPasswordReset = async (_, { confirmPasswordResetInput }) => {
	const { emailToken, newPassword } = confirmPasswordResetInput
	const passwordResetToken = await VerificationToken.findOne({token: emailToken}).populate('user')
    const { user } = passwordResetToken
    user.password = newPassword
	await user.save()
	return Promise.all([
		VerificationToken.deleteMany({user:user._id}),
		AuthToken.deleteAllBy(user)
	]).then(() => ({message: 'Password changed, continue to login'}))
}

module.exports = {
	confirmPasswordResetInput,
	confirmPasswordReset
}

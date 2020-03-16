const User = require('../../models/user');
const AuthToken = require('../../models/auth_token')

const PasswordResetToken = require('../../models/verification_token/password_reset');
const VerificationToken = require('../../models/verification_token/verification_token');

const confirmPasswordResetInput = `
	input ConfirmPasswordResetInput {
		emailToken: String!,
		newPassword: String!
	}
`

const confirmPasswordReset = async (_, { confirmPasswordResetInput }) => {
	const { emailToken, newPassword } = confirmPasswordResetInput
	const passwordResetToken = await PasswordResetToken.findOne({token: emailToken})
    const user = await User.findOne({_id: passwordResetToken.user})
    user.password = newPassword
	await user.save()
	return Promise.all([
		VerificationToken.deleteMany({user:user._id}),
		AuthToken.deleteMany({user:user._id})
	]).then(() => ({message: 'Password changed, continue to login'}))
}

module.exports = {
	confirmPasswordResetInput,
	confirmPasswordReset
}

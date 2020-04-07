import { AuthToken } from '../types/User/AuthToken'

import { VerificationToken }  from '../types/User/VerificationToken'

export const confirmPasswordResetInput = `
	input ConfirmPasswordResetInput {
		emailToken: String!,
		newPassword: String!
	}
`

export const confirmPasswordReset = async (_, { confirmPasswordResetInput }) => {
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

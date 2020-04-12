import AuthToken from '../models/User/AuthToken'
import VerificationToken from '../models/User/VerificationToken'

type ConfirmPasswordResetInputType = {
	emailToken: string;
	newPassword: string;
}

export const confirmPasswordResetInput = `
	input ConfirmPasswordResetInput {
		emailToken: String!,
		newPassword: String!
	}
`

export const confirmPasswordReset = async (_: void, { confirmPasswordResetInput }: { confirmPasswordResetInput: ConfirmPasswordResetInputType}) => {
	const { emailToken, newPassword } = confirmPasswordResetInput
	const passwordResetToken = await VerificationToken.findRecord(emailToken)
	const user = await passwordResetToken.getUser()
    user.password = newPassword
	await user.save()
	return Promise.all([
		VerificationToken.deleteAllBy(user._id),
		AuthToken.deleteAllBy(user._id)
	]).then(() => ({message: 'Password changed, continue to login'}))
}

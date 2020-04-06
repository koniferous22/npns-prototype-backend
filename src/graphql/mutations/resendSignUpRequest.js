import { User } from '../types/User';
import { VerificationToken } from '../types/User/VerificationToken';

import nodemailer  from '../../external/nodemailer'

export const resendSignUpRequestInput = `
	input ResendSignUpRequestInput {
		username: String!
	}
`
export const resendSignUpRequest = async (_, { resendSignUpRequestInput }) => {
	const { username } = resendSignUpRequestInput
	const user = await User.findByIdentifier(username)
	if (user.verified) {
		throw new Error('User is verified')
	}
	await VerificationToken.deleteMany({user: user._id})
    const token = new VerificationToken({user: user._id})
    return Promise.all([token.save(), nodemailer.sendEmail(nodemailer.tempaltes.signupTemplate, { token })])
    	.then(() => ({
    		message: 'Request resent, check email'
    	}))
}

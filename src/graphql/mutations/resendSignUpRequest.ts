import User from '../models/User';
import VerificationToken from '../models/User/VerificationToken';

import nodemailer  from '../../external/nodemailer'

type ResendSignUpRequestInputType = {
	username: string;
}

export const resendSignUpRequestInput = `
	input ResendSignUpRequestInput {
		username: String!
	}
`
export const resendSignUpRequest = async (_: void, { resendSignUpRequestInput }: { resendSignUpRequestInput: ResendSignUpRequestInputType }) => {
	const { username } = resendSignUpRequestInput
	const user = await User.findByIdentifier(username)
	if (user.verified) {
		throw new Error('User is verified')
	}
	await VerificationToken.deleteMany({user: user._id})
    const token = new VerificationToken({user: user._id})
    return Promise.all([token.save(), nodemailer.sendMail(user.email, nodemailer.templates.signUpTemplate, { token: token.token })])
    	.then(() => ({
    		message: 'Request resent, check email'
    	}))
}

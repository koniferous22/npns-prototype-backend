const User = require('../../models/user')
const VerificationToken = require('../../models/verification_token/verification_token');

const { signupTemplate } = require('../../nodemailer/templates')

const resendSignUpRequestInput = `
	input ResendSignUpRequestInput {
		username: String!
	}
`
const resendSignUpRequest = async (_, { resendSignUpRequestInput }) => {
	const { username } = resendSignUpRequestInput
	const user = await User.find().byLogin(username)
	if (user.verified) {
		throw new Error('User is verified')
	}
	await VerificationToken.deleteMany({user: user._id})
    const token = new VerificationToken({user: user._id})
    return Promise.all([token.save(), user.sendEmail(signupTemplate, {token})])
    	.then(() => ({
    		message: 'Request resent, check email'
    	}))
}

module.exports = {
	resendSignUpRequestInput,
	resendSignUpRequest
}

const { User } = require('../types/User');
const { VerificationToken } = require('../types/User/VerificationToken');

const nodemailer = require('../../external/nodemailer')

const resendSignUpRequestInput = `
	input ResendSignUpRequestInput {
		username: String!
	}
`
const resendSignUpRequest = async (_, { resendSignUpRequestInput }) => {
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

module.exports = {
	resendSignUpRequestInput,
	resendSignUpRequest
}

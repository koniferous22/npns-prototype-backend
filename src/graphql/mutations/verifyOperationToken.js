const { AuthToken } = require('../types/User/AuthToken');

const VerificationToken = require('../../models/verification_token/verification_token');
const PasswordResetToken = require('../../models/verification_token/password_reset');
const EmailChangeToken = require('../../models/verification_token/email_change');
const UsernameChangeToken = require('../../models/verification_token/username_change');

const { signupTemplate } = require('../../nodemailer/templates')

const verifiedOperations = {
	signUp: {
		findToken: async (token) => VerificationToken.findOne({token}),
		forceLogout: false,
		cancelAllTokenOperation: false,
		userCallback: async (user) => {
			user.setVerifiedFlag()
			return user.save()
		},
		responseMessage: 'Cunt'
	},
	passwordReset: {
		findToken: async (token) => PasswordResetToken.findOne({token}),
		cancelAllTokenOperation: false,
		forceLogout: true,
		responseMessage: 'Fuck off'
	},
	emailChange: {
		findToken: async (token) => EmailChangeToken.findOne({token}),
		cancelAllTokenOperation: true,
		forceLogout: true,
		responseMessage: 'fuckingdie'
	},
	usernameChange: {
		findToken: async (token) => UsernameChangeToken.findOne({token}),
		cancelAllTokenOperation: true,
		forceLogout: true,
		responseMessage:'aaaaaaaaa'
	}
}

const verifyOperationTokenInput = `
	input VerifyOperationTokenInput {
		emailToken: String!
		operationType: String!
	}
`

const verifyOperationToken = async (_, { verifyOperationTokenInput }) => {
	const { emailToken, operationType } = verifyOperationTokenInput
	const verifiedOperation = verifiedOperations[operationType]
	if (!verifiedOperation) {
		throw new Error('Invalid token operation')
	}
	const {
		findToken,
		forceLogout,
		cancelAllTokenOperation,
		userCallback,
		responseMessage
	} = verifiedOperation
	const user = (await findToken(emailToken).populate('user')).user
	if (forceLogout) {
        await AuthToken.deleteAllBy(user)
	}
	if (cancelAllTokenOperation) {
		await VerificationToken.deleteMany({user})
	}
	if (userCallback) {
		return userCallback(user)
	}
	return {
		message: responseMessage
	}
}

module.exports = {
	verifyOperationTokenInput,
	verifyOperationToken	
}

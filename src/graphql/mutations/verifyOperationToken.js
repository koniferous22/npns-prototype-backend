const { AuthToken } = require('../types/User/AuthToken');

const { VerificationToken } = require('../types/User/VerificationToken');

// const { signupTemplate } = require('../../external/nodemailer/templates')

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
		findToken: async (token) => VerificationToken.findOne({token}),
		cancelAllTokenOperation: false,
		forceLogout: true,
		responseMessage: 'Fuck off'
	},
	emailChange: {
		findToken: async (token) => VerificationToken.findOne({token}),
		cancelAllTokenOperation: true,
		forceLogout: true,
		responseMessage: 'fuckingdie'
	},
	usernameChange: {
		findToken: async (token) => VerificationToken.findOne({token}),
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

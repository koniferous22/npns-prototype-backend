import { AuthToken } from '../types/User/AuthToken';

import { VerificationToken } from '../types/User/VerificationToken';

// import { signupTemplate } from '../../external/nodemailer/templates'

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

export const verifyOperationTokenInput = `
	input VerifyOperationTokenInput {
		emailToken: String!
		operationType: String!
	}
`

export const verifyOperationToken = async (_, { verifyOperationTokenInput }) => {
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

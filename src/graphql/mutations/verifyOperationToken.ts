import { UserType } from '../models/User'
import AuthToken, { AuthTokenType } from '../models/User/AuthToken';

import VerificationToken, { VerificationTokenType } from '../models/User/VerificationToken';

type VerifiedOperation = {
	findToken: (token: string) => Promise<VerificationTokenType>;
	forceLogout: boolean;
	cancelAllTokenOperation: boolean;
	responseMessage: string;
	userCallback?: (user: UserType) => Promise<UserType>;
}

const getVerifiedOperation: (type: string) => VerifiedOperation = (type) => {
	switch (type) {
		case 'signUp':
			return {
				findToken: async (token: string) => VerificationToken.findOne({token}),
				forceLogout: false,
				cancelAllTokenOperation: false,
				userCallback: async (user: UserType) => {
					user.setUserVerified()
					return user.save()
				},
				responseMessage: 'Cunt'
			}
		case 'passwordReset': 
			return {
				findToken: async (token: string) => VerificationToken.findOne({token}),
				cancelAllTokenOperation: false,
				forceLogout: true,
				responseMessage: 'Fuck off'
			}
		case 'emailChange':
			return {
				findToken: async (token: string) => VerificationToken.findOne({token}),
				cancelAllTokenOperation: true,
				forceLogout: true,
				responseMessage: 'fuckingdie'
			}
		case 'usernameChange':
			return {
				findToken: async (token: string) => VerificationToken.findOne({token}),
				cancelAllTokenOperation: true,
				forceLogout: true,
				responseMessage:'aaaaaaaaa'
			}
		default:
			throw new Error('Invalid type')
	}
}

export const verifyOperationTokenInput = `
	input VerifyOperationTokenInput {
		emailToken: String!
		operationType: String!
	}
`

type VerifyOperationTokenInputType = {
	emailToken: string;
	operationType: string;
}

export const verifyOperationToken = async (_: void, { verifyOperationTokenInput }: { verifyOperationTokenInput: VerifyOperationTokenInputType }) => {
	const { emailToken, operationType } = verifyOperationTokenInput
	const verifiedOperation = getVerifiedOperation(operationType)
	if (!verifiedOperation) {
		throw new Error('Invalid (token: string) operation')
	}
	const {
		findToken,
		forceLogout,
		cancelAllTokenOperation,
		userCallback,
		responseMessage
	} = verifiedOperation
	const token = await findToken(emailToken)
	const user = await token.getUser()
	if (forceLogout) {
        await AuthToken.deleteAllBy(user.id)
	}
	if (cancelAllTokenOperation) {
		await VerificationToken.deleteAllBy(user.id)
	}
	if (userCallback) {
		return userCallback(user)
	}
	return {
		message: responseMessage
	}
}

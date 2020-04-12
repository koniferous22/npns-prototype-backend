import User, { UserType } from '../models/User';

import VerificationToken, { VerificationTokenType } from '../models/User/VerificationToken';
import nodemailer, { NodemailerTemplateType }  from '../../external/nodemailer'

import { authentication } from '../../utils/authentication'

// TODO reimplement payload as oneof
type RequestProfileChangeInputType = {
	operationType: string;
	token: string;
	identifier: string;
	newEmail?: string;
	newUsername?: string;
	newFirstName?: string;
	newLastName?: string;
}

export const requestProfileChangeInput = `
	input RequestProfileChangeInput {
		operationType: String!,
		token: String,
		identifier: String,
		newEmail: String,
		newUsername: String,
		newFirstName: String,
		newLastName: String
	}
`

type UpdatedUserFields = {
	newEmail?: string;
	newUsername?: string;
	newFirstName?: string;
	newLastName?: string;
}

interface ProfileOperation {
	auth: boolean;
	createToken(user: UserType, updatedUserFields: UpdatedUserFields): VerificationTokenType;
	mailTemplate: NodemailerTemplateType;
	resolve(user: UserType, updatedUserFields: UpdatedUserFields): Promise<void>;
}

const getProfileOperation: (type: string) => ProfileOperation = (type: string) => {
	switch (type) {
		case 'emailChange':
			return {
				auth: true,
				createToken: (user: UserType, { newEmail }: UpdatedUserFields) => new VerificationToken({user, newEmail}),
				mailTemplate: nodemailer.templates.emailChangeTemplate
			}
		case 'usernameChange':
			return {
				auth: true,
				createToken: (user: UserType, { newUsername }: UpdatedUserFields) => new VerificationToken({user, newUsername}),
				mailTemplate: nodemailer.templates.usernameChangeTemplate
			}
		case 'passwordReset':
			return {
				auth: false,
				createToken: (user: UserType, _: void) => new VerificationToken({user})
			}
		case 'namesChange':
			return {
				auth: true,
				resolve: async (user: UserType, { newFirstName, newLastName }: UpdatedUserFields) => {
					user.firstName = newFirstName || user.firstName
		        	user.lastName = newLastName || user.lastName
		        	return user.save()
				}
			}
		default:
			throw new Error('Invalid profile request')
	}
}

export const requestProfileChange = async (_: void, { requestProfileChangeInput }: { requestProfileChangeInput: RequestProfileChangeInputType } ) => {
	const { operationType, token, identifier, ...payload } = requestProfileChangeInput
	const profileOperation = getProfileOperation(operationType)
	if (!profileOperation) {
		throw new Error('Invalid profile operation')
	}
	const { auth, createToken, mailTemplate, resolve } = profileOperation
	const userRecord = await (auth ? authentication(token) : User.findByIdentifier(identifier))
	const user = userRecord._id
	if (resolve) {
		await resolve(user, payload)
	}
	if (createToken) {
		const operationToken = createToken(user, payload)
		await operationToken.save()
	}
	if (mailTemplate) {
		await nodemailer.sendMail(userRecord.email, mailTemplate, { token })
	}
	return {
		message: 'Profile updated'
	}
}

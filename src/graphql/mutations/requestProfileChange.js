import { User } from '../types/User';

import { VerificationToken } from '../types/User/VerificationToken';
import nodemailer  from '../../external/nodemailer'

import { authentication } from '../../utils/authentication'

// TODO reimplement payload as oneof
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

const profileOperations = {
	emailChange: {
		auth: true,
		createToken: (user, { newEmail }) => new VerificationToken({user, newEmail}),
		mailTemplate: nodemailer.templates.emailChange
	},
	usernameChange: {
		auth: true,
		createToken: (user, { newUsername }) => new VerificationToken({user, newUsername}),
		mailTemplate: nodemailer.templates.usernameChange
	},
	passwordReset: {
		auth: false,
		createToken: (user, _) => new VerificationToken({user})
	},
	namesChange: {
		auth: true,
		resolve: async (user, { newFirstName, newLastName }) => {
			user.firstName = newFirstName || user.firstName
        	user.lastName = newLastName || user.lastName
        	return user.save()
		}
	}
}

export const requestProfileChange = async (_, { requestProfileChangeInput }) => {
	const { operationType, token, identifier, ...payload } = requestProfileChangeInput
	const profileOperation = profileOperations[operationType]
	if (!profileOperation) {
		throw new Error('Invalid profile operation')
	}
	const { auth, createToken, mailTemplate, resolve } = profileOperation
	const userRecord = await (auth ? authentication(token) : User.findByIdentifier(identifier))
	const user = userRecord._id
	if (resolve) {
		await resolve(payload)
	}
	if (createToken) {
		const operationToken = createToken(user, payload)
		await operationToken.save()
	}
	if (mailTemplate) {
		await nodemailer.sendMail(mailTemplate, payload)
	}
	return {
		message: 'Profile updated'
	}
}

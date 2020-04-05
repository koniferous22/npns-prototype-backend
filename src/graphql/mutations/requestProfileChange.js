const { User } = require('../types/User');

const { VerificationToken } = require('../types/User/VerificationToken');

const { pwdResetTemplate, emailChangeTemplate, usernameChangeTemplate } = require('../../nodemailer/templates');

const { authentication } = require('../../utils/authentication')

// TODO reimplement payload as oneof
const requestProfileChangeInput = `
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
		mailTemplate: emailChangeTemplate
	},
	usernameChange: {
		auth: true,
		createToken: (user, { newUsername }) => new VerificationToken({user, newUsername}),
		mailTemplate: usernameChangeTemplate
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

const requestProfileChange = async (_, { requestProfileChangeInput }) => {
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
		await userRecord.sendMail(mailTemplate, payload)
	}
	return {
		message: 'Profile updated'
	}
}

module.exports = {
	requestProfileChangeInput,
	requestProfileChange
}
const User = require('../../models/user');

const PasswordResetToken = require('../../models/verification_token/password_reset');
const EmailChangeToken = require('../../models/verification_token/email_change');
const UsernameChangeToken = require('../../models/verification_token/username_change');
const VerificationToken = require('../../models/verification_token/verification_token');

const { pwdResetTemplate, emailChangeTemplate, usernameChangeTemplate } = require('../../nodemailer/templates');

const { authentication } = require('../../utils/authentication')

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
		createToken: (user, { newEmail }) => new EmailChangeToken({user, newEmail}),
		mailTemplate: emailChangeTemplate
	},
	usernameChange: {
		auth: true,
		createToken: (user, { newUsername }) => new UsernameChangeToken({user, newUsername}),
		mailTemplate: usernameChangeTemplate
	},
	passwordReset: {
		auth: false,
		createToken: (user, _) => new PasswordResetToken({user})
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

const requestProfileChange = async (_, { operationType, token, identifier, ...payload }) => {
	const profileOperation = profileOperations[operationType]
	if (!profileOperation) {
		throw new Error('Invalid profile operation')
	}
	const { auth, createToken, mailTemplate, resolve } = profileOperation
	const userRecord = await (auth ? authentication(token) : User.find().byLogin(identifier))
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
}

module.exports = {
	requestProfileChangeInput,
	requestProfileChange
}
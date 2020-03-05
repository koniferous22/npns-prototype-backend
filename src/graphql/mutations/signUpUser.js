const User = require('../../models/user')
const VerificationToken = require('../../models/verification_token/verification_token');

const signUpUserInput = `
	input SignUpUserInput {
		username: String!
		password: String!
		email: String!
		firstName: String
		lastName: String
	}
`

const signUpUserPayload = `
	type SignUpUserPayload {
		createdUser: User
	}
`

const signUpUser = (_, {signUpUserInput}) => {
	const user = new User(signUpUserInput)
	return User.find({$or: [{username: signUpUserInput.username}, {email: signupTemplate.email}]}).then(usersFound => {
			if (usersFound.length > 0) {
			throw new Error ('User with same identifier already exists')
		}
		return user.save().then(savedUser => {
			const token = new VerificationToken({user: user._id})
			return token.save()
		}).then(savedToken => {
			return user.sendEmail(signupTemplate, {token: savedToken.token})
		}).then(mailInfo => {
			return {createdUser: user}
		}).catch(error => {
			console.log('jebal pes')
			throw error
		})
	})
}

module.exports = {
	signUpUserInput,
	signUpUserPayload,
	signUpUser
}

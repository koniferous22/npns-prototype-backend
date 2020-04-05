const { User } = require('../types/User');
const { VerificationToken } = require('../types/User/VerificationToken')

const signUserUpInput = `
	input SignUserUpInput {
		username: String!
		password: String!
		email: String!
		firstName: String
		lastName: String
	}
`
const signUserUpPayload = `
	type SignUserUpPayload {
		createdUser: User
	}
`

const signUserUp = async (_, { signUserUpInput }) => {
	const { username, password, email, firstName, lastName } = signUserUpInput;
	const user = User.signUp(username, password, email, firstName, lastName)
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
}

module.exports = {
	signUserUpInput,
	signUserUpPayload,
	signUserUp
}

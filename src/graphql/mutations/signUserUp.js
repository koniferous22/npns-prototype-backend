const { User } = require('../types/User');
const VerificationToken = require('../../models/verification_token/verification_token');

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
	const { username, email } = signUserUpInput;
	const identifiersAvailable = await User.areIdentifiersAvailable(username, email);
	const user = new User(signUserUpInput)
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

import { User } from '../types/User';
import { VerificationToken } from '../types/User/VerificationToken'

export const signUserUpInput = `
	input SignUserUpInput {
		username: String!
		password: String!
		email: String!
		firstName: String
		lastName: String
	}
`
export const signUserUpPayload = `
	type SignUserUpPayload {
		createdUser: User
	}
`

export const signUserUp = async (_, { signUserUpInput }) => {
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

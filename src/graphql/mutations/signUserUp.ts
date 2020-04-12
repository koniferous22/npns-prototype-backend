import User, { UserType } from '../models/User';
import VerificationToken, { VerificationTokenType } from '../models/User/VerificationToken'
import nodemailer from '../../external/nodemailer';


type SignUserUpInputType = {
	username: string;
	password: string;
	email: string;
	firstName: string;
	lastName: string;
}

export const signUserUpInput = `
	input SignUserUpInput {
		username: String!
		password: String!
		email: String!
		firstName: String
		lastName: String
	}
`
type SignUserUpPayloadType = {
	createdUser: UserType;
}

export const signUserUpPayload = `
	type SignUserUpPayload {
		createdUser: User
	}
`

export const signUserUp = async (_: void, { signUserUpInput }: { signUserUpInput: SignUserUpInputType }) => {
	const { username, password, email, firstName, lastName } = signUserUpInput;
	const user = User.signUp(username, password, email, firstName, lastName)
	const token = new VerificationToken({user: user._id})
	await Promise.all([
		user.save(),
		token.save(),
		nodemailer.sendMail(user.email, nodemailer.templates.signUpTemplate, {token: token.token})
	])
	return {
		createdUser: user
	}
}

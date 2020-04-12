import { VerificationTokenType } from '../../graphql/models/User/VerificationToken'

type NodemailerTemplateArgs = {
	frontendAdress: string;
	token: string;
}

type NodemailerTemplateResult = {
	subject: string;
	text: string;
	html: string;
}

export type NodemailerTemplateType = (args: NodemailerTemplateArgs) => NodemailerTemplateResult;

const signUpTemplate = ({ frontendAdress, token }: NodemailerTemplateArgs) => {
	const fullAdress = frontendAdress + "confirm/registration/" + token
	return {
		subject: 'NPNS Regoostration code',
		text: 'Copy following address to confirm email:\n' + fullAdress,
		html: '<p>Click <a href="' + fullAdress + '">here</a> to confirm your email</p>'
	}
}

const pwdResetTemplate = ({ frontendAdress, token }: NodemailerTemplateArgs) => {
	const fullAdress = frontendAdress + "confirm/passwordChange/" + token
	return {
		subject: 'NPNS Password Reset Link',
		text: 'Copy following address to reset ur password:\n' + fullAdress,
		html: '<p>Click <a href="' + fullAdress + '">here</a> to confirm your new password</p>'
	}
}

const emailChangeTemplate = ({ frontendAdress, token }: NodemailerTemplateArgs) => {
	const fullAdress = frontendAdress + "confirm/emailChange/" + token
	return {
		subject: 'NPNS Email Change Link',
		text: 'Copy following address to confirm email:\n' + fullAdress,
		html: '<p>Click <a href="' + fullAdress + '">here</a> to confirm your newly chosen email adventurer</p>'
	}
}

const usernameChangeTemplate = ({ frontendAdress, token }: NodemailerTemplateArgs) => {
	const fullAdress = frontendAdress + "confirm/usernameChange/" + token
	return {
		subject: 'NPNS Username Change Link',
		text: 'Copy following address to confirm your new username:\n' + fullAdress,
		html: '<p>Click <a href="' + fullAdress + '">here</a> to confirm your new finely chosen username adventurer</p>'
	}
}

export default {
	signUpTemplate,
	pwdResetTemplate,
	emailChangeTemplate,
	usernameChangeTemplate
}
const signupTemplate = (params) => {
	const frontend_address = "http://localhost:3001/confirm/registration/"
	return {
		subject: 'NPNS Regoostration code',
		text: 'Copy following address to confirm email:\n' + frontend_address + params.token,
		html: '<p>Click <a href="' + frontend_address + params.token + '">here</a> to confirm your email</p>'
	}
}

const pwdResetTemplate = (params) => {
	const frontend_address = "http://localhost:3001/confirm/passwordChange/"
	return {
		subject: 'NPNS Password Reset Link',
		text: 'Copy following address to reset ur password:\n' + frontend_address + params.token,
		html: '<p>Click <a href="' + frontend_address + params.token + '">here</a> to confirm your new password</p>'
	}
}

module.exports = {
	signupTemplate,
	pwdResetTemplate
}
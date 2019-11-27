const signupTemplate = (params) => {
	const frontend_address = "https://romantic-swanson-171168.netlify.com/confirm/registration/"
	return {
		subject: 'NPNS Regoostration code',
		text: 'Copy following address to confirm email:\n' + frontend_address + params.token,
		html: '<p>Click <a href="' + frontend_address + params.token + '">here</a> to confirm your email</p>'
	}
}

const pwdResetTemplate = (params) => {
	const frontend_address = "https://romantic-swanson-171168.netlify.com/confirm/passwordChange/"
	return {
		subject: 'NPNS Password Reset Link',
		text: 'Copy following address to reset ur password:\n' + frontend_address + params.token,
		html: '<p>Click <a href="' + frontend_address + params.token + '">here</a> to confirm your new password</p>'
	}
}

const emailChangeTemplate = (params) => {
	const frontend_address = "https://romantic-swanson-171168.netlify.com/confirm/emailChange/"
	return {
		subject: 'NPNS Email Change Link',
		text: 'Copy following address to confirm email:\n' + frontend_address + params.token,
		html: '<p>Click <a href="' + frontend_address + params.token + '">here</a> to confirm your newly chosen email adventurer</p>'
	}
}

const usernameChangeTemplate = (params) => {
	const frontend_address = "https://romantic-swanson-171168.netlify.com/confirm/usernameChange/"
	return {
		subject: 'NPNS Username Change Link',
		text: 'Copy following address to confirm your new username:\n' + frontend_address + params.token,
		html: '<p>Click <a href="' + frontend_address + params.token + '">here</a> to confirm your new finely chosen username adventurer</p>'
	}
}

module.exports = {
	signupTemplate,
	pwdResetTemplate,
	emailChangeTemplate,
	usernameChangeTemplate
}
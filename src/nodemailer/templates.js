const signupTemplate = (params) => ({
	subject: 'NPNS Regoostration code',
	text: 'auth code: ' + params.token,
	html: '<p>auth code: ' + params.token + '</p>'
})

const pwdResetTemplate = (params) => ({
	subject: 'NPNS Password Reset',
	text: 'Password reset link: ' + params.token,
	html: '<p>Password reset link: ' + params.token + '</p>'
})

module.exports = {
	signupTemplate,
	pwdResetTemplate
}
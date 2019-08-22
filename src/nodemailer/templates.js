const signupTemplate = (token) => ({
	subject: 'NPNS Regoostration code',
	text: 'auth code: ' + token,
	html: '<p>auth code: ' + token + '</p>'
})


module.exports = {
	signupTemplate
}
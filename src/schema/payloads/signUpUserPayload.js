// possibly extend by mailInfo, for more read nodemailer docuentation (transport.sendMail)
const signUpUserPayload = `
	type SignUpUserPayload {
		createdUser: User
	}
`

module.exports = signUpUserPayload

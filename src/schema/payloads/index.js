const signUpUserPayload = require('./signUpUserPayload')
const signInUserPayload = require('./signInUserPayload')

const payloads = `
	${signUpUserPayload}
	${signInUserPayload}
`

module.exports = payloads

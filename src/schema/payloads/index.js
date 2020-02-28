const signUpUserPayload = require('./signUpUserPayload')
const signInUserPayload = require('./signInUserPayload')
const postChallengePayload = require('./postChallengePayload')
const postSubmissionPayload = require('./postSubmissionPayload')
const messagePayload = require('./messagePayload')

const payloads = `
	${signUpUserPayload}
	${signInUserPayload}
	${postChallengePayload}
	${postSubmissionPayload}
	${messagePayload}
`

module.exports = payloads

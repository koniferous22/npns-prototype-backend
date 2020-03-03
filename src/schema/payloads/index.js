const messagePayload = require('./messagePayload')

const markChallengeSolvedPayload = require('./markChallengeSolvedPayload')
const postChallengePayload = require('./postChallengePayload')
const postSubmissionPayload = require('./postSubmissionPayload')
const postReplyPayload = require('./postReplyPayload')
const signUpUserPayload = require('./signUpUserPayload')
const signInUserPayload = require('./signInUserPayload')

const payloads = `
	${messagePayload}
	${markChallengeSolvedPayload}
	${postChallengePayload}
	${postSubmissionPayload}
	${postReplyPayload}
	${signUpUserPayload}
	${signInUserPayload}
`

module.exports = payloads

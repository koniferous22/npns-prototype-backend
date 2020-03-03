const confirmPasswordInput = require('./confirmPasswordInput')
const markChallengeSolvedInput = require('./markChallengeSolvedInput')
const signUpUserInput = require('./signUpUserInput')
const signInUserInput = require('./signInUserInput')
const postChallengeInput = require('./postChallengeInput')
const postSubmissionInput = require('./postSubmissionInput')
const postReplyInput = require('./postReplyInput')
const tokenInput = require('./tokenInput')

const inputTypes = `
	${confirmPasswordInput}
	${markChallengeSolvedInput}
	${postChallengeInput}
	${postSubmissionInput}
	${postReplyInput}
	${signUpUserInput}
	${signInUserInput}
	${tokenInput}
`

module.exports = inputTypes

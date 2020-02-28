const signUpUserInput = require('./signUpUserInput')
const signInUserInput = require('./signInUserInput')
const postChallengeInput = require('./postChallengeInput')
const postSubmissionInput = require('./postSubmissionInput')
const tokenInput = require('./tokenInput')

const inputTypes = `
	${postChallengeInput}
	${postSubmissionInput}
	${signUpUserInput}
	${signInUserInput}
	${tokenInput}
`

module.exports = inputTypes

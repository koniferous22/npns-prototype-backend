const {
	boostChallengeInput,
	boostChallengePayload,
	boostChallenge
} = require('./boostChallenge')
const {
	confirmPasswordInput,
	confirmPassword
} = require('./confirmPassword')
const { logoutUser } = require('./logoutUser')
const { logoutUserAllDevices } = require('./logoutUserAllDevices')
const {
	markChallengeSolvedInput,
	markChallengeSolvedPayload,
	markChallengeSolved
} = require('./markChallengeSolved')
const {
	postChallengeInput,
	postChallengePayload,
	postChallenge
} = require('./postChallenge')
const {
	postReplyInput,
	postReplyPayload,
	postReply
} = require('./postReply')
const {
	postSubmissionInput,
	postSubmissionPayload,
	postSubmission
} = require('./postSubmission')
const {
	signInUserInput,
	signInUserPayload,
	signInUser
} = require('./signInUser')
const {
	signUpUserInput,
	signUpUserPayload,
	signUpUser
} = require('./signUpUser')

const mutationInputs = `
	${boostChallengeInput}
	${confirmPasswordInput}
	${markChallengeSolvedInput}
	${postChallengeInput}
	${postReplyInput}
	${postSubmissionInput}
	${signInUserInput}
	${signUpUserInput}
`

const mutationPayloads = `
	${boostChallengePayload}
	${markChallengeSolvedPayload}
	${postChallengePayload}
	${postReplyPayload}
	${postSubmissionPayload}
	${signInUserPayload}
	${signUpUserPayload}
`

const mutationSchema = `
	${mutationInputs}
	${mutationPayloads}
	type Mutation {
		boostChallenge(boostChallengeInput: BoostChallengeInput!): BoostChallengePayload
		confirmPassword(confirmPasswordInput: ConfirmPasswordInput!): MessagePayload
		signUpUser(signUpUserInput: SignUpUserInput!): SignUpUserPayload
		signInUser(signInUserInput: SignInUserInput!): SignInUserPayload
		logoutUser(logoutInput: TokenInput!): MessagePayload
		logoutUserAllDevices(logoutInput: TokenInput!): MessagePayload
		markChallengeSolved(markChallengeSolvedInput: MarkChallengeSolvedInput!): MarkChallengeSolvedPayload
		postChallenge(postChallengeInput: PostChallengeInput!): PostChallengePayload
		postSubmission(postSubmissionInput: PostSubmissionInput!): PostSubmissionPayload
		postReply(postReplyInput: PostReplyInput!): PostReplyPayload
	}
`

const Mutation = {
	boostChallenge,
	confirmPassword,
	logoutUser,
	logoutUserAllDevices,
	markChallengeSolved,
	postChallenge,
	postReply,
	postSubmission,
	signInUser,
	signUpUser	
}

module.exports = {
	Mutation,
	mutationSchema
}

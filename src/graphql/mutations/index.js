const {
	boostChallengeInput,
	boostChallengePayload,
	boostChallenge
} = require('./boostChallenge')
const {
	confirmPasswordInput,
	confirmPassword
} = require('./confirmPassword')
const {
	confirmPasswordResetInput,
	confirmPasswordReset
} = require('./confirmPasswordReset')
const {
	createQueueInput,
	createQueuePayload,
	createQueue
} = require('./createQueue')
const {
	keepAlivePayload,
	keepAlive
} = require('./keepAlive')
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
	requestProfileChangeInput,
	requestProfileChange
} = require('./requestProfileChange')
const {
	signUserInInput,
	signUserInPayload,
	signUserIn
} = require('./signUserIn')
const {
	signUserUpInput,
	signUserUpPayload,
	signUserUp
} = require('./signUserUp')
const  {
	verifyOperationTokenInput,
	verifyOperationToken
} = require('./verifyOperationToken')

const mutationInputs = `
	${boostChallengeInput}
	${createQueueInput}
	${confirmPasswordInput}
	${confirmPasswordResetInput}
	${markChallengeSolvedInput}
	${postChallengeInput}
	${postReplyInput}
	${postSubmissionInput}
	${requestProfileChangeInput}
	${signUserInInput}
	${signUserUpInput}
	${verifyOperationTokenInput}
`

const mutationPayloads = `
	${boostChallengePayload}
	${createQueuePayload}
	${keepAlivePayload}
	${markChallengeSolvedPayload}
	${postChallengePayload}
	${postReplyPayload}
	${postSubmissionPayload}
	${signUserInPayload}
	${signUserUpPayload}
`

const mutationSchema = `
	${mutationInputs}
	${mutationPayloads}
	type Mutation {
		boostChallenge(boostChallengeInput: BoostChallengeInput!): BoostChallengePayload
		confirmPassword(confirmPasswordInput: ConfirmPasswordInput!): MessagePayload
		confirmPasswordReset(confirmPasswordResetInput: ConfirmPasswordResetInput!): MessagePayload
		createQueue(createQueueInput: CreateQueueInput!): CreateQueuePayload
		keepAlive(keepAliveInput: TokenInput!): KeepAlivePayload
		logoutUser(logoutInput: TokenInput!): MessagePayload
		logoutUserAllDevices(logoutInput: TokenInput!): MessagePayload
		markChallengeSolved(markChallengeSolvedInput: MarkChallengeSolvedInput!): MarkChallengeSolvedPayload
		postChallenge(postChallengeInput: PostChallengeInput!): PostChallengePayload
		postSubmission(postSubmissionInput: PostSubmissionInput!): PostSubmissionPayload
		postReply(postReplyInput: PostReplyInput!): PostReplyPayload
		requestProfileChange(requestProfileChangeInput: RequestProfileChangeInput!): MessagePayload
		signUserUp(signUserUpInput: SignUserUpInput!): SignUserUpPayload
		signUserIn(signUserInInput: SignUserInInput!): SignUserInPayload
		verifyOperationToken(verifyOperationTokenInput: VerifyOperationTokenInput!): MessagePayload
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
	signUserIn,
	signUserUp	
}

module.exports = {
	Mutation,
	mutationSchema
}

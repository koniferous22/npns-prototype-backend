const {
	paging,
	tokenInput
} = require('./input');
const {
	messagePayload
} = require('./payload');

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
	editContentInput,
	editContentPayload,
	editContent
} = require('./editContent')
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
	resendSignUpRequestInput,
	reseneSignUpRequest
} = require('./resendSignUpRequest')
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
	${tokenInput}
	${paging}
	${boostChallengeInput}
	${createQueueInput}
	${confirmPasswordInput}
	${confirmPasswordResetInput}
	${editContentInput}
	${markChallengeSolvedInput}
	${postChallengeInput}
	${postReplyInput}
	${postSubmissionInput}
	${resendSignUpRequestInput}
	${requestProfileChangeInput}
	${signUserInInput}
	${signUserUpInput}
	${verifyOperationTokenInput}
`

const mutationPayloads = `
	${messagePayload}
	${boostChallengePayload}
	${createQueuePayload}
	${editContentPayload}
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
		editContent(editContentInput: EditContentInput!): EditContentPayload
		keepAlive(keepAliveInput: TokenInput!): KeepAlivePayload
		logoutUser(logoutInput: TokenInput!): MessagePayload
		logoutUserAllDevices(logoutInput: TokenInput!): MessagePayload
		markChallengeSolved(markChallengeSolvedInput: MarkChallengeSolvedInput!): MarkChallengeSolvedPayload
		postChallenge(postChallengeInput: PostChallengeInput!): PostChallengePayload
		postSubmission(postSubmissionInput: PostSubmissionInput!): PostSubmissionPayload
		postReply(postReplyInput: PostReplyInput!): PostReplyPayload
		resendSignUpRequest(resendSignUpRequestInput: ResendSignUpRequestInput!): MessagePayload
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

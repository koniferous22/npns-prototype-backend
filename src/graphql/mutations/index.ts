import {
	paging,
	tokenInput,
	messagePayload
} from '../utils/types';
import {
	boostChallengeInput,
	boostChallengePayload,
	boostChallenge
} from './boostChallenge'
import {
	confirmPasswordInput,
	confirmPassword
} from './confirmPassword'
import {
	confirmPasswordResetInput,
	confirmPasswordReset
} from './confirmPasswordReset'
import {
	createQueueInput,
	createQueuePayload,
	createQueue
} from './createQueue'
import {
	keepAlivePayload,
	keepAlive
} from './keepAlive'
import { logoutUser } from './logoutUser'
import { logoutUserAllDevices } from './logoutUserAllDevices'
import {
	markChallengeSolvedInput,
	markChallengeSolvedPayload,
	markChallengeSolved
} from './markChallengeSolved'
import {
	postChallengeInput,
	postChallengePayload,
	postChallenge
} from './postChallenge'
import {
	postReplyInput,
	postReplyPayload,
	postReply
} from './postReply'
import {
	postSubmissionInput,
	postSubmissionPayload,
	postSubmission
} from './postSubmission'
import {
	resendSignUpRequestInput,
	resendSignUpRequest
} from './resendSignUpRequest'
import {
	requestProfileChangeInput,
	requestProfileChange
} from './requestProfileChange'
import {
	signUserInInput,
	signUserInPayload,
	signUserIn
} from './signUserIn'
import {
	signUserUpInput,
	signUserUpPayload,
	signUserUp
} from './signUserUp'
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

//${editContentPayload}
const mutationPayloads = `
	${messagePayload}
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

export const mutationSchema = `
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
		resendSignUpRequest(resendSignUpRequestInput: ResendSignUpRequestInput!): MessagePayload
		requestProfileChange(requestProfileChangeInput: RequestProfileChangeInput!): MessagePayload
		signUserUp(signUserUpInput: SignUserUpInput!): SignUserUpPayload
		signUserIn(signUserInInput: SignUserInInput!): SignUserInPayload
		verifyOperationToken(verifyOperationTokenInput: VerifyOperationTokenInput!): MessagePayload
	}

`

export const Mutation = {
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

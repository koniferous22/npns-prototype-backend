const { gql } = require('apollo-server-express')
const { GraphQLDate, GraphQLDateTime } = require('graphql-iso-date')

const mutationInputs = require('./inputs')
const mutationPayloads = require('./payloads')
const scalars = require('./scalars')
const types = require('./types')

const schema = gql`
	${scalars}
	${mutationInputs}
	${mutationPayloads}
	${types}

	type Query {
		queues: [Queue!]
		queue(name: String!): Queue
		user(username: String!): User
		challenge(challengeId: ID!): Challenge
	}

	type Mutation {
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

module.exports = schema
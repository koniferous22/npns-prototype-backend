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
		signUpUser(signUpUserInput: SignUpUserInput!): SignUpUserPayload
		signInUser(signInUserInput: SignInUserInput!): SignInUserPayload
		#createQueue(name: String, parent: ID): Queue
	}
`

module.exports = schema
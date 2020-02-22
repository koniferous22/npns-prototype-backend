const { gql } = require('apollo-server-express')
const { GraphQLDate, GraphQLDateTime } = require('graphql-iso-date')

const scalars = require('./scalars')

const ContentSchemas = require('./content')
const QueueSchema = require('./Queue')
const UserSchema = require('./User')
const TransactionSchema = require('./Transaction')

const schema = gql`
	${scalars}
	
	${ContentSchemas}
	${QueueSchema}
	${TransactionSchema}
	${UserSchema}

	type Query {
		queues: [Queue!]
		queue(name: String!): Queue
		user(username: String!): User
		challenge(challengeId: ID!): Challenge
	}

	type Mutation {
		userSignUp(username: String!, password: String!, email: String!, firstName: String, lastName: String): User
		#createQueue(name: String, parent: ID): Queue
	}
`

module.exports = schema
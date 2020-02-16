const { gql } = require('apollo-server-express')
const { GraphQLDate, GraphQLDateTime } = require('graphql-iso-date')

const schema = gql`

	scalar Date
	scalar DateTime
	
	type ContentEdit {
		contents: String!
		edited: Date!
	}

	type Boost {
		boostValue: Float!
		boostedBy: User
		# payPalOrder: ???
	}

	interface Content {
		id: ID!
		submittedBy: User!
		created: Date!
		active: Boolean!
		content: String!
		edits: [ContentEdit!]!
		attachmentUrls: [String!]!
	}
	
	type Challenge {
		# interface copy-paste
		id: ID!
		submittedBy: User!
		created: Date!
		active: Boolean!
		content: String!
		edits: [ContentEdit!]!
		attachmentUrls: [String!]!
		# end of interface copy-paste

		queue: Queue!
		rootQueueValue: Float! # wtf
		#acceptedSubmission: Submission
		title: String!
		viewCount: Int!
		#submissions: [Submission!]!
		boosts: [Boost!]!
	}

	type Balance {
		queue: Queue!
		balance: Int!
	}

	# add custom validation, either one of those two has to be non-null
	type Transaction {
		sender: User
		recipient: User
		queue: Queue
		karmaValue: Float!
		monetaryValue: Float!
		created: Date
		description: String!
	}

	type User {
		username: String!
		email: String!
		firstName: String
		lastName: String
		referredBy: User
		# rename to balances
		balanceEntries: [Balance!]!
		verified: Boolean!
		allowNsfw: Boolean!
		transactions(page:Int!, count: Int!): [Transaction]
	}

	type Queue {
		# POSSIBLY NOT EXPOSE QUEUE IDS
		#id: ID!
		name: String!
		karmaValue: Int!
		parent: Queue
		children: [Queue]!
		descendants: [Queue]!
		ancestors: [Queue]!
		#problems: [String]
		#scoreboard: [String]
		#user_count: [String]
	}

	type Query {
		queues: [Queue!]
		queue(name: String!): Queue
		user(username: String!): User
	}

	type Mutation {
		createQueue(name: String, parent: ID): Queue
	}
`

module.exports = schema
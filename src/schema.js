const { gql } = require('apollo-server-express');

const schema = gql`
	"""
	interface Content {
		id: ID!
		#replace with user object later
		submittedBy: String,
		#created: 
	}
	"""

	type Balance {
		queue: Queue!
		balance: Int!
	}

	# add custom validation, either one of those two has to be non-null
	type Transaction {
		sender: User
		recipient: User
		queue: Queue
		karmaValue: Number
		monetaryValue: Number
		#timestamp: 
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
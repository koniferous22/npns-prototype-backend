const { gql } = require('apollo-server-express');

const schema = gql`
	type Queue {
		_id: ID!
		name: String!
		parentId: Queue
		#descendants: [String]
		#ancestors: [String]
		#problems: [String]
		#scoreboard: [String]
		#user_count: [String]
	}

	type HierarchyEntry {
		queue: String!
		children: [HierarchyEntry!]!
	}
	
	type Hierarchy {
		hierarchy: HierarchyEntry!
	}

	type Query {
		queues: [Queue!]
		queue(name: String!): Queue
		hierarchy: Hierarchy!
	}

	type Mutation {
		createQueue(name: String, parent: ID): Queue
	}
`

module.exports = schema
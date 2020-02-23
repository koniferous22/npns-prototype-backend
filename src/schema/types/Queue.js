const QueueSchema = `type Queue {
	# POSSIBLY NOT EXPOSE QUEUE IDS
	#id: ID!
	name: String!
	karmaValue: Int!
	parent: Queue
	children: [Queue]!
	descendants: [Queue]!
	ancestors: [Queue]!
	challengePages: Int!
	challenges: [Challenge!]!
	#scoreboard: [String]
	#user_count: [String]
}`

module.exports = QueueSchema

const Queue = require('../../models/queue')
const User = require('../../models/user')
const Challenge = require('../../models/post/challenge')
const { QUEUE_FIELDS } = require('../utils/queryFields')

const querySchema = `
	type Query {
		queues: [Queue!]
		queue(name: String!): Queue
		user(username: String!): User
		challenge(challengeId: ID!): Challenge
	}

`

const Query = {
	queues: async () => await Queue.find({}, QUEUE_FIELDS).sort({name: 'asc'}),
	queue: async (_, {name}) => await Queue.findOne( {name} , QUEUE_FIELDS),

	user: async (_, {username}) => await User.findOne().byLogin(username),
	challenge: async (_, {challengeId}) => await Challenge.viewProblem(challengeId)
}

module.exports = {
	querySchema,
	Query
}

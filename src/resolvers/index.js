const QueueAPI = require('../models/queue')
const UserAPI = require('../models/user')

const Challenge = require('./accessors/Challenge')
const Queue = require('./accessors/Queue')
const Submission = require('./accessors/Submission')
const Transaction = require('./accessors/Transaction')
const User = require('./accessors/User')

const { QUEUE_FIELDS } = require('./constants')

const Query = {
	queues: async () => await QueueAPI.find({}, QUEUE_FIELDS).sort({name: 'asc'}),
	queue: async (_, {name}) => await QueueAPI.findOne( {name} , QUEUE_FIELDS).populate({path: 'parentId', select: QUEUE_FIELDS}),

	user: async (_, {username}) => await UserAPI.findOne().byLogin(username)
}
const Mutation = {

}

module.exports = {
	Challenge,
	Queue,
	User,
	Submission,
	Transaction,
	Query,
	Mutation
}

const QueueAPI = require('./models/queue')
const UserAPI = require('./models/user')

const QUEUE_FIELDS = 'id name parentId karmaValue lft rgt depth'

const USER_FIELDS = 'username email firstName lastName referred_by balanceEntries allowNsfw'

const Queue = {
	parent: async queue => await queue.populate({path: 'parentId', select: QUEUE_FIELDS}),
	children: async queue => await QueueAPI.find({parentId: queue._id}, QUEUE_FIELDS),
	
	// Ineffective method when querying multiple queues and get descendant for each
	descendants: async queue => {
		const filter = {
			lft: {
				$gte: queue.lft
			},
			rgt: {
				$lte: queue.rgt
			}
		}

		const result = await QueueAPI.find(filter, QUEUE_FIELDS)
		return result
	},

	ancestors: async queue => {
		const filter = {
			lft: {
				$lt: queue.lft
			},
			rgt: {
				$gt: queue.rgt
			}
		}
		const result = await QueueModel.find(filter, QUEUE_FIELDS)
		return result
	}
}

const User = {
	balanceEntries: async user => await user.populate({path: 'balanceEntries.balance', select: QUEUE_FIELDS}),
	referredBy: async user => await user.populate({path: 'referred_by', select: USER_FIELDS}),
	transactions: async (user, {page}) => {
		
	}
}

const Query = {
	queues: async () => await QueueAPI.find({}, QUEUE_FIELDS).sort({name: 'asc'}),
	queue: async (_, {name}) => await QueueAPI.findOne( {name} , QUEUE_FIELDS).populate({path: 'parentId', select: QUEUE_FIELDS}),

	user: async (_, {username}) => await UserAPI.findOne().byLogin(username)
}
const Mutation = {

}

module.exports = {
	Queue,
	Query,
	Mutation
}

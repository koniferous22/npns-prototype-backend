const QueueAPI = require('./models/queue')
const UserAPI = require('./models/user')
const TransactionAPI = require('./models/transaction')

const QUEUE_FIELDS = 'id name parentId karmaValue lft rgt depth'
const USER_FIELDS = 'username email firstName lastName referred_by balanceEntries allowNsfw'
const TRANSACTION_FIELDS = 'sender recipient queue karmaValue monetaryValue created description'

const Transaction = {
	sender: async transaction => (await transaction.populate({path: 'sender', select: USER_FIELDS}).execPopulate()).sender,
	recipient: async transaction => (await transaction.populate({path: 'recipient', select: USER_FIELDS}).execPopulate()).recipient,
	queue: async transaction => (await transaction.populate({path: 'queue', select: QUEUE_FIELDS}).execPopulate()).queue

}

const Queue = {
	parent: async queue => (await queue.populate({path: 'parentId', select: QUEUE_FIELDS}).execPopulate()).parent,
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
	balanceEntries: async user => (await user.populate({path: 'balanceEntries.balance', select: QUEUE_FIELDS}).execPopulate()).balanceEntries,
	referredBy: async user => (await user.populate({path: 'referred_by', select: USER_FIELDS}).execPopulate()).referredBy,
	transactions: async (user, {page, count}) => {
		page = (page > 1) ? page : 1
        count = (count >  1) ? count : 50
		const size = await TransactionAPI.countDocuments({$or: [
			{
				sender: user.id
			},
			{
				recipient: user.id
			}
		]})
		const transactions = await TransactionAPI.find({$or: [
			{
				sender: user.id
			},
			{
				recipient: user.id
			}
		]}).sort({created: 'desc'}).skip(count * (page - 1))
		return transactions
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
	User,
	Transaction,
	Query,
	Mutation
}

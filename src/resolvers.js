const QueueAPI = require('./models/queue');

const QUEUE_FIELDS = 'id name parentId karmaValue lft rgt depth'

const Queue = {
	parent: queue => queue.parentId,
	
	// Ineffective method when querying multiple queues and get descendant for each
	descendants: async (queue) => {
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

	ancestors: async (queue) => {
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

const Query = {
	queues: async () => await QueueAPI.find({}, QUEUE_FIELDS).sort({name: 'asc'}).populate({path: 'parentId', select: QUEUE_FIELDS}),
	queue: async (_, {name}) => await QueueAPI.findOne( {name} , QUEUE_FIELDS).populate({path: 'parentId', select: QUEUE_FIELDS}),
	hierarchy: async () =>  await QueueAPI.hierarchy()
}
const Mutation = {

}

module.exports = {
	Queue,
	Query,
	Mutation
}

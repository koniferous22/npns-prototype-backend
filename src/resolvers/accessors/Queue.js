const QueueAPI = require('../../models/queue')
const ChallengeAPI = require('../../models/content/problem')

const { QUEUE_FIELDS, CHALLENGE_FIELDS } = require('../constants')


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
		const result = await QueueAPI.find(filter, QUEUE_FIELDS)
		return result
	},

	challengePages: async (queue, {pageSize = 50}) => {
		const desc = await QueueAPI.find().descendants({name: queue.name},'id')
		const challengesCount = await ChallengeAPI.countDocuments({
			active: true,
			queue:{
				$in: desc.map(x => x.id)
			}
		})
		const pagesCount = Math.floor(challengesCount / pageSize) + (challengesCount % pageSize > 0 ? 1 : 0)
		return pagesCount
	},

	challenges: async (queue, {page = 1, count = 50}) => {
		const desc = await QueueAPI.find().descendants({name: queue.name},'id')
		const size = await ChallengeAPI.countDocuments({
			active: true,
			queue:{
				$in: desc.map(x => x.id)
			}
		})

		const challenges = await ChallengeAPI.find({
			active: true,
			queue:{
				$in: desc
			}
		}).sort({root_queue_value:'desc'}).skip(count * (page - 1)).limit(count)
		return challenges
	}
}

module.exports = Queue

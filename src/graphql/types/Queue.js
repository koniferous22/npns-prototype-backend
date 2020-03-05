const QueueModel = require('../../models/queue')
const Challenge = require('../../models/content/problem')

const { QUEUE_FIELDS, CHALLENGE_FIELDS } = require('../utils/queryFields')

const queueSchema = `
	type Queue {
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
	}
`

const Queue = {
	parent: async queue => (await queue.populate({path: 'parentId', select: QUEUE_FIELDS}).execPopulate()).parent,
	children: async queue => await QueueModel.find({parentId: queue._id}, QUEUE_FIELDS),
	
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

		const result = await QueueModel.find(filter, QUEUE_FIELDS)
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
	},

	challengePages: async (queue, {pageSize = 50}) => {
		const desc = await QueueModel.find().descendants({name: queue.name},'id')
		const challengesCount = await Challenge.countDocuments({
			active: true,
			queue:{
				$in: desc.map(x => x.id)
			}
		})
		const pagesCount = Math.floor(challengesCount / pageSize) + (challengesCount % pageSize > 0 ? 1 : 0)
		return pagesCount
	},

	challenges: async (queue, {page = 1, count = 50}) => {
		const desc = await QueueModel.find().descendants({name: queue.name},'id')
		const size = await Challenge.countDocuments({
			active: true,
			queue:{
				$in: desc.map(x => x.id)
			}
		})

		const challenges = await Challenge.find({
			active: true,
			queue:{
				$in: desc
			}
		}).sort({root_queue_value:'desc'}).skip(count * (page - 1)).limit(count)
		return challenges
	}
}


module.exports = {
	queueSchema,
	Queue
}

const QueueModel = require('../../models/queue')
const User = require('../../models/user')
const Challenge = require('../../models/post/challenge')

const { QUEUE_FIELDS, CHALLENGE_FIELDS, USER_FIELDS } = require('../utils/queryFields')

const queueSchema = `
	type Queue {
		# Don't leave queue _ids exposed
		name: String!
		karmaValue: Int!
		# related Qs
		parent: Queue
		children: [Queue]!
		descendants: [Queue]!
		ancestors: [Queue]!

		challenges(paging: Paging): [Challenge!]!
		challengePageCount(pageSize: Int): Int!
		challengePosition(challengeId: String!): Int

		scoreboard(paging: Paging): [User!]!
		scoreboardPageCount(pageSize: Int): Int!
		scoreboardUserPosition(username: String!): Int
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

	challenges: async (queue, { paging = { page: 1, pageSize: 50 } }) => {
		const { page, pageSize } = paging
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
		}).sort({root_queue_value:'desc'}).skip(pageSize * (page - 1)).limit(pageSize)
		return challenges
	},
	challengePageCount: async (queue, { pageSize = 50 }) => {
		const desc = await QueueModel.find().descendants({name: queue.name},'id')
		const challengesCount = await Challenge.countDocuments({
			active: true,
			queue:{
				$in: desc.map(x => x.id)
			}
		})
		const pageCount = Math.floor(challengesCount / pageSize) + (challengesCount % pageSize > 0 ? 1 : 0)
		return pageCount
	},
	challengePosition: async (queue, { challengeId }) => {
		const descendantQueues = await Queue.find().descendants({_id: queue._id},'_id')
		const challenge = await Challenge.findOne({_id: challengeId})
		return descendantQueues.find((descendantQueue) => descendantQueue._id.equals(challenge.queue))
			? await Challenge.countDocuments({
					queue:{
						$in: descendantQueues.map(({ _id }) => _id)
					},
					root_queue_value: {
						$gte: challenge.root_queue_value
					}
				})
			: null
	},
	// Migrate Away
	scoreboard: (queue, { paging = { page: 1, pageSize: 50 }}) => [],
	scoreboardPageCount: (queue, { pageSize = 50}) => 1,
	scoreboardUserPosition: (queue, { username }) => 0
}


module.exports = {
	queueSchema,
	Queue
}

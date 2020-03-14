const QueueModel = require('../../models/queue')
const User = require('../../models/user')
const Challenge = require('../../models/content/problem')

const { QUEUE_FIELDS, CHALLENGE_FIELDS, USER_FIELDS } = require('../utils/queryFields')

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
		challengePages(pageSize: Int): Int!
		challenges(paging: Paging): [Challenge!]!
		
		scoreboard(paging: Paging): [User!]!
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

	challengePages: async (queue, { pageSize = 50 }) => {
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

	scoreboard: (queue, { paging = { page: 1, pageSize: 50 }}) => {
		const { page, pageSize } = paging
		const balance_specifier = 'balances.' + queue._id
		const sort_params = { [balance_specifier]: 'desc' }
		return User.find({[balance_specifier]: { $exists: true }}, USER_FIELDS + ' ' + balance_specifier)
			.sort(sort_params)
			.skip(pageSize * (page - 1))
			.limit(pageSize)
	}
}


module.exports = {
	queueSchema,
	Queue
}

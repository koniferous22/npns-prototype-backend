const mongoose = require('mongoose')
const nestedSetPlugin = require('mongoose-nested-set')

const Challenge = require('../../models/post/challenge')

const { CHALLENGE_FIELDS } = require('../utils/queryFields')
const { USER_FIELDS } = require('./User')

const QueueDbSchema = mongoose.Schema({
	name: {
    	type: String,
    	unique: true,
    	trim: true,
    	required: true
	},
	depth: {
		type: Number,
		default: 0
	},
	karmaValue: {
		type: Number,
		default: 0
	}
});

QueueDbSchema.plugin(nestedSetPlugin)

QueueDbSchema.add({
	parentId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Queue',
		index:true
	}
});

QueueModel = mongoose.model('Queue', QueueDbSchema, 'Queue')

const QUEUE_FIELDS = 'id name parentId karmaValue lft rgt depth'
const ROOT_NAME = 'All'

const QueueMethods = {
	findByName: (name) => QueueModel.findOne({ name }, QUEUE_FIELDS),
	findRoot: () => this.findByName(ROOT_NAME),
	findAll: () => QueueModel.find({}, QUEUE_FIELDS),
	createQueue: async (name, parentName) => this.findByName(parentName).then((parentQueue) => {
		const newQueue = new Queue({
			parentId: parentQueue._id,
			name: name
		})
		return newQueue.save()
	})
}

const QueueSchema = `
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
	QUEUE_FIELDS,
	QueueMethods,
	QueueSchema,
	Queue
}

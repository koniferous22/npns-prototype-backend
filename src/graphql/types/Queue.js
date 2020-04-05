const mongoose = require('mongoose')
const nestedSetPlugin = require('mongoose-nested-set')

const Challenge = require('./Challenge')

const QueueDbSchema = new mongoose.Schema({
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

// h4xx0rz to overwrite shema of plugin parentId
QueueDbSchema.add({
	parentId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Queue',
		index:true
	}
});

const ROOT_NAME = 'All'

QueueDbSchema.statics.findByName = function (name) {
	return this.findOne({ name })
}
QueueDbSchema.statics.findRoot = function () {
	return this.findByName(ROOT_NAME)
}
QueueDbSchema.statics.findAll = function () {
	return this.find({})
}
QueueDbSchema.statics.createQueue = function (name, parentName) {
	return this.findByName(parentName).then((parentQueue) => {
		const newQueue = new Queue({
			parentId: parentQueue._id,
			name: name
		})
		return newQueue.save()
	})
}

Queue = mongoose.model('Queue', QueueDbSchema, 'Queue')

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

const QueueResolvers = {
	parent: async queue => (await queue.populate({path: 'parentId'}).execPopulate()).parent,
	children: async queue => await Queue.find({parentId: queue._id}),
	
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

		const result = await Queue.find(filter)
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
		const result = await Queue.find(filter)
		return result
	},

	challenges: async (queue, { paging = { page: 1, pageSize: 50 } }) => {
		const { page, pageSize } = paging
		const desc = await Queue.find().descendants({name: queue.name},'id')
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
		const desc = await Queue.find().descendants({name: queue.name},'id')
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
	Queue,
	QueueSchema,
	QueueResolvers
}

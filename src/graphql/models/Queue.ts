import mongoose  from 'mongoose'
import nestedSetPlugin  from 'mongoose-nested-set'

import Challenge from './Challenge'

import { PagingType, PagingSizeType } from '../utils/types'

export interface QueueType extends mongoose.Document {
	name: string;
	karmaValue: number;
	// used by nested set plugin
	leftIndex: number;
	rightIndex: number;
	parent: mongoose.Types.ObjectId;
	children: mongoose.Types.ObjectId[];
	depth: number;
	ancestors: mongoose.Types.ObjectId[];
	descendants: mongoose.Types.ObjectId[];
	
	getField<T>(fieldName: string): Promise<T>;
};

const QueueDbSchema = new mongoose.Schema({
	name: {
    	type: String,
    	unique: true,
    	trim: true,
    	required: true
	},
	karmaValue: {
		type: Number,
		default: 0
	},
	// Plugin reimplementation
	leftIndex: {
		type: Number,
		default: 0
	},
	rightIndex: {
		type: Number,
		default: 0
	},
	parent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Queue',
		required: true
	},
	children: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Queue',
		required: true
	}],
	depth: {
		type: Number,
		default: 0
	},
	ancestors: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Queue',
		required: true
	}],
	descendants: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Queue',
		required: true
	}],
});

QueueDbSchema.statics.findByName = function (name: string) {
	return this.findOne({ name })
}
QueueDbSchema.statics.findRoot = function () {
	return this.findByName({ leftIndex: 0 })
}
QueueDbSchema.statics.findAll = function () {
	return this.find({})
}
QueueDbSchema.statics.createQueue = async function (name: string, parentName: string, karmaValue? :number) {
	const parentQueue = await this.findByName(parentName)
	if (!parentQueue) {
		throw new Error('Invalid parent queue')
	}
	await parentQueue.populate('children').execPopulate()
	const siblings = parentQueue.children
	const maxRightIndex = siblings.reduce((currentMax: number, sibling: QueueType) => Math.max(currentMax, sibling.rightIndex), parentQueue.leftIndex)
	const newQueue = new Queue({
		name: name,
		karmaValue: karmaValue,
		leftIndex: maxRightIndex + 1,
		rightIndex: maxRightIndex + 2,
		parent: parentQueue._id,
		children: [],
		depth: parentQueue.depth + 1,
		ancestors: parentQueue.ancestors.concat(parentQueue._id),
		descendants: []
	});
	const updateLeftIndices = this.updateMany({ leftIndex: { $gt: maxRightIndex }}, { $inc: { leftIndex: 2 } })
	const updateRightIndices = this.updateMany({ rightIndex: { $gt: maxRightIndex }}, { $inc: { rightIndex: 2 } })
	parentQueue.children.push(newQueue._id)
	const updateAncestors = this.updateManey({ _id: { $in: newQueue.ancestors }}, { $push: { descendants: newQueue._id } })

	await Promise.all([
		newQueue.save(),
		parentQueue.save(),
		updateLeftIndices,
		updateRightIndices,
		updateAncestors
	])
	return newQueue
};

QueueDbSchema.methods.getField = async function getField<T>(fieldName: string): Promise<T> {
	return (await this.populate(fieldName).execPopulate())[fieldName] as T
}

interface QueueModelType extends mongoose.Model<QueueType> {
	findByName(name: string): Promise<QueueType>;
	findRoot(): Promise<QueueType>;
	findAll(): Promise<QueueType[]>;
	createQueue(name: string, parentName: string, karmaValue?: number): Promise<QueueType>;
}

const Queue = mongoose.model<QueueType, QueueModelType>('Queue', QueueDbSchema, 'Queue')

export const QueueSchema = `
	type Queue {
		# Don't leave queue _ids exposed
		name: String!
		karmaValue: Int!
		leftIndex: Number!
		rightIndex: Number!
		depth: Number!
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


export const QueueResolvers = {
	parent: (queue: QueueType) => queue.getField<QueueType>('parent'),
	children: (queue: QueueType) => queue.getField<QueueType[]>('children'),
	ancestors: (queue: QueueType) => queue.getField<QueueType[]>('ancestors'),
	descendants: (queue: QueueType) => queue.getField<QueueType[]>('descendants'),

	challenges: async (queue: QueueType, { paging = { page: 1, pageSize: 50 } }: { paging: PagingType }) => {
		const { page, pageSize } = paging
		const descendants = await queue.getField<QueueType[]>('descendants')
		const size = await Challenge.countDocuments({
			active: true,
			queue:{
				$in: descendants.map(x => x.id)
			}
		})
		const challenges = await Challenge.find({
			active: true,
			queue:{
				$in: descendants.map(x => x.id)
			}
		}).sort({root_queue_value:'descendants'}).skip(pageSize * (page - 1)).limit(pageSize)
		return challenges
	},
	challengePageCount: async (queue: QueueType, { pageSize = 50 }: PagingSizeType) => {
		const descendants = await queue.getField<QueueType[]>('descendants')
		const challengesCount = await Challenge.countDocuments({
			active: true,
			queue:{
				$in: descendants.map(x => x.id)
			}
		})
		const pageCount = Math.floor(challengesCount / pageSize) + (challengesCount % pageSize > 0 ? 1 : 0)
		return pageCount
	},
	challengePosition: async (queue: QueueType, { challengeId }: { challengeId: mongoose.Types.ObjectId }): Promise<number | null> => {
		const descendantQueues = await queue.getField<QueueType[]>('descendants')
		const challenge = await Challenge.findOne({_id: challengeId})
		return descendantQueues.find((descendantQueue: QueueType) => descendantQueue.id.equals(challenge.queue))
			? await Challenge.countDocuments({
					queue:{
						$in: descendantQueues.map((dq) => dq._id)
					},
					rootQueueValue: {
						$gte: challenge.rootQueueValue
					}
				})
			: null
	},
	// Migrate Away
	scoreboard: (queue: QueueType, { paging: PagingType = { page: 1, pageSize: 50 }}): string[] => [],
	scoreboardPageCount: (queue: QueueType, { pageSize = 50 }: PagingSizeType): number=> 1,
	scoreboardUserPosition: (queue: QueueType, { username }: { username: string }): number => 0
}

export default Queue

import mongoose  from 'mongoose'

export type QueueType = mongoose.Document & {
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
    required: function() {
      return this.leftIndex > 0;
    }
  } as ThisType<QueueType>,
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

QueueDbSchema.statics.createQueue = async function (name: string, parentName: string, karmaValue? :number) {
  const parentQueue = await this.findByName(parentName)
  if (!parentQueue) {
    throw new Error('Invalid parent queue')
  }
  await parentQueue.populate('children').execPopulate()
  const siblings = parentQueue.children
  const maxRightIndex = siblings.reduce((currentMax: number, sibling: QueueType) => Math.max(currentMax, sibling.rightIndex), parentQueue.leftIndex)
  const newQueue = new QueueModel({
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
  const updateAncestors = this.updateMany({ _id: { $in: newQueue.ancestors }}, { $push: { descendants: newQueue._id } })

  // Transaction
  await Promise.all([
    newQueue.save(),
    parentQueue.save(),
    updateLeftIndices,
    updateRightIndices,
    updateAncestors
  ])
  return newQueue
};

export type QueueModelType = mongoose.Model<QueueType> & {
	createQueue(name: string, parentName: string, karmaValue?: number): Promise<QueueType>;
}

export const QueueModel = mongoose.model<QueueType, QueueModelType>('Queue', QueueDbSchema, 'Queue')

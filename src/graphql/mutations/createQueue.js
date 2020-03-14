const Queue = require('../../models/queue')

const { QUEUE_FIELDS } = require('../utils/queryFields')

const createQueueInput = `
	input CreateQueueInput {
		parentQueueName: String!
		queueName: String!
	}
`

const createQueuePayload = `
	type CreateQueuePayload {
		newQueue: Queue
	}
`

const createQueue = (_, {createQueueInput}) => Queue.findOne({name: createQueueInput.parentQueueName}, QUEUE_FIELDS).then((parentQueue) => {
	const newQueue = new Queue({
		parentId: parentQueue._id,
		name: createQueueInput.queueName
	})
	return newQueue.save()
})

module.exports = {
	createQueueInput,
	createQueuePayload,
	createQueue
}

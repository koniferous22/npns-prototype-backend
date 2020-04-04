const { QueueMethods, QUEUE_FIELDS } = require('../types/Queue')

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

const createQueue = (_, { createQueueInput }) => QueueMethods.createQueue(createQueueInput.queueName, createQueueInput.parentQueueName)

module.exports = {
	createQueueInput,
	createQueuePayload,
	createQueue
}

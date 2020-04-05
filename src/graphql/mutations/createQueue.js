const { Queue } = require('../types/Queue')

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

const createQueue = (_, { createQueueInput }) => Queue.createQueue(createQueueInput.queueName, createQueueInput.parentQueueName)

module.exports = {
	createQueueInput,
	createQueuePayload,
	createQueue
}

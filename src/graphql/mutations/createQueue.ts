import { Queue } from '../types/Queue'

export const createQueueInput = `
	input CreateQueueInput {
		parentQueueName: String!
		queueName: String!
	}
`

export const createQueuePayload = `
	type CreateQueuePayload {
		newQueue: Queue
	}
`

export const createQueue = (_, { createQueueInput }) => Queue.createQueue(createQueueInput.queueName, createQueueInput.parentQueueName)

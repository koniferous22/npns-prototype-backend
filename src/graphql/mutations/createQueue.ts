import Queue from '../models/Queue'

type CreateQueueInputType = {
	parentQueueName: string;
	queueName: string;
}

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

export const createQueue = (_: void, { createQueueInput }: { createQueueInput: CreateQueueInputType } ) =>
	Queue.createQueue(createQueueInput.queueName, createQueueInput.parentQueueName)

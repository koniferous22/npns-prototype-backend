const { QUEUE_FIELDS } = require('./Queue')
const { USER_FIELDS } = require('./Queue')

const transactionSchema = `
	# add custom validation, either one of those two has to be non-null
	type Transaction {
		sender: User
		recipient: User
		queue: Queue
		karmaValue: Float!
		monetaryValue: Float!
		created: Date
		description: String!
	}
`

const Transaction = {
	sender: async transaction => (await transaction.populate({path: 'sender', select: USER_FIELDS}).execPopulate()).sender,
	recipient: async transaction => (await transaction.populate({path: 'recipient', select: USER_FIELDS}).execPopulate()).recipient,
	queue: async transaction => (await transaction.populate({path: 'queue', select: QUEUE_FIELDS}).execPopulate()).queue

}

module.exports = {
	transactionSchema,
	Transaction
}

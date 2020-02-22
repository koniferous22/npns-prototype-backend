const { QUEUE_FIELDS, USER_FIELDS } = require('../constants')

const Transaction = {
	sender: async transaction => (await transaction.populate({path: 'sender', select: USER_FIELDS}).execPopulate()).sender,
	recipient: async transaction => (await transaction.populate({path: 'recipient', select: USER_FIELDS}).execPopulate()).recipient,
	queue: async transaction => (await transaction.populate({path: 'queue', select: QUEUE_FIELDS}).execPopulate()).queue

}

module.exports = Transaction

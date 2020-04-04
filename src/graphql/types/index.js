const { postSchemas, postAccessors } = require('./post')
const { QueueSchema, Queue } = require('./Queue')
const { UserSchema, User } = require('./User')
const { transactionSchema, Transaction } = require('./Transaction')

const types = `
	${postSchemas}

	${QueueSchema}
	${UserSchema}
	${transactionSchema}
`
const accessors = {
	...postAccessors,
	Queue,
	User,
	Transaction
}

module.exports = {
	accessors,
	types
}

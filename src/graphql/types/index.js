const { postSchemas, postAccessors } = require('./post')
const { queueSchema, Queue } = require('./Queue')
const { UserSchema, User } = require('./User')
const { transactionSchema, Transaction } = require('./Transaction')

const types = `
	${postSchemas}

	${queueSchema}
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

const commonTypes = require('./common')

const { postSchemas, postAccessors } = require('./post')
const { queueSchema, Queue } = require('./Queue')
const { userSchema, User } = require('./User')
const { transactionSchema, Transaction } = require('./Transaction')

const types = `
	${commonTypes}

	${postSchemas}

	${queueSchema}
	${userSchema}
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

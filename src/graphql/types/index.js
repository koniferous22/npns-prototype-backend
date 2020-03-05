const commonTypes = require('./common')

const { contentSchemas, contentAccessors } = require('./content')
const { queueSchema, Queue } = require('./Queue')
const { userSchema, User } = require('./User')
const { transactionSchema, Transaction } = require('./Transaction')

const types = `
	${commonTypes}

	${contentSchemas}

	${queueSchema}
	${userSchema}
	${transactionSchema}
`
const accessors = {
	...contentAccessors,
	Queue,
	User,
	Transaction
}

module.exports = {
	accessors,
	types
}

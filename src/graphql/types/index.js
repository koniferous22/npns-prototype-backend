const { postSchemas, postAccessors } = require('./post')
const { QueueSchema, QueueResolvers } = require('./Queue')
const { UserSchema, UserResolvers } = require('./User')
const { TransactionSchema, TransactionResolvers } = require('./Transaction')

const types = `
	${postSchemas}

	${QueueSchema}
	${UserSchema}
	${TransactionSchema}
`
const accessors = {
	...postAccessors,
	Queue: QueueResolvers,
	User: UserResolvers,
	Transaction: TransactionResolvers
}

module.exports = {
	accessors,
	types
}

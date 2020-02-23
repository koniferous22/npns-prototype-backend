const ContentSchemas = require('./content')
const QueueSchema = require('./Queue')
const UserSchema = require('./User')
const TransactionSchema = require('./Transaction')

const Types = `
	${ContentSchemas}
	${QueueSchema}
	${UserSchema}
	${TransactionSchema}
`

module.exports = Types

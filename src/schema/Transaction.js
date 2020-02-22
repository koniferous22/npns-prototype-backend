const TransactionSchema = `
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

module.exports = TransactionSchema

const UserSchema = `
type Balance {
	queue: Queue!
	balance: Int!
}

type User {
	username: String!
	email: String!
	firstName: String
	lastName: String
	referredBy: User
	# rename to balances
	balanceEntries: [Balance!]!
	verified: Boolean!
	allowNsfw: Boolean!
	transactions(page:Int!, count: Int!): [Transaction]
}`

module.exports = UserSchema

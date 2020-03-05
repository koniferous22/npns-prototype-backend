const Transaction = require('../../models/transaction')

const { QUEUE_FIELDS, USER_FIELDS } = require('../utils/queryFields')

const userSchema = `
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
		transactions(page:Int!, count: Int!, authToken: String!): [Transaction]
	}
`

const User = {
	balanceEntries: async user => (await user.populate({path: 'balanceEntries.balance', select: QUEUE_FIELDS}).execPopulate()).balanceEntries,
	referredBy: async user => (await user.populate({path: 'referred_by', select: USER_FIELDS}).execPopulate()).referredBy,
	// TODO: added default params, make sure that typescript allows non-negative params in functions
	transactions: async (user, {page = 1, count = 50, authToken}) => {
		
		const size = await Transaction.countDocuments({$or: [
			{
				sender: user.id
			},
			{
				recipient: user.id
			}
		]})
		const transactions = await Transaction.find({$or: [
			{
				sender: user.id
			},
			{
				recipient: user.id
			}
		]}).sort({created: 'desc'}).skip(count * (page - 1))
		return transactions
	}
}

module.exports = {
	userSchema,
	User
}

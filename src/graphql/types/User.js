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
		transactions(paging: Paging, authToken: String!): [Transaction!]!
		posts(paging: Paging): [Challenge!]!
		#postPage
	}
`

const User = {
	balanceEntries: async user => (await user.populate({path: 'balanceEntries.balance', select: QUEUE_FIELDS}).execPopulate()).balanceEntries,
	referredBy: async user => (await user.populate({path: 'referred_by', select: USER_FIELDS}).execPopulate()).referredBy,
	// TODO: added default params, make sure that typescript allows non-negative params in functions
	transactions: async (user, {paging = { page: 1, pageSize: 50 }, authToken}) => {
		const { page, pageSize } = paging	
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
		]}).sort({created: 'desc'}).skip(pageSize * (page - 1))
		return transactions
	},
	posts: async (user, { paging = { page: 1, pageSize: 50 }}) => {
		const { page, pageSize } = paging
		const size = await Content.find({submitted_by: user_id}).countDocuments()
		const hasMore = (page * count) < size
		
	}
}

module.exports = {
	userSchema,
	User
}

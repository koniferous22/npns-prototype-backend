const Transaction = require('../../models/transaction')
const Content = require('../../models/content/content')

const { QUEUE_FIELDS, USER_FIELDS } = require('../utils/queryFields')

const userSchema = `
	type Balance {
		queue: Queue!
		balance: Int!
	}

	type User {
		# Basic data
		username: String!
		email: String!
		firstName: String
		lastName: String
		# referral
		referredBy: User
		# misc
		balanceEntries: [Balance!]!
		verified: Boolean!
		allowNsfw: Boolean!
		
		# related transactions
		transactions(paging: Paging, authToken: String!): [Transaction!]!
		transactionPageCount(pageSize: Int, authToken: String!): Int!
		# related posts		
		posts(paging: Paging): [Challenge!]!
		postPageCount(pageSize: Int): Int!
	}
`

const User = {
	balanceEntries: async user => (await user.populate({path: 'balanceEntries.balance', select: QUEUE_FIELDS}).execPopulate()).balanceEntries,
	referredBy: async user => (await user.populate({path: 'referred_by', select: USER_FIELDS}).execPopulate()).referredBy,
	// TODO: added default params, make sure that typescript allows non-negative params in functions
	transactions: async (user, { paging = { page: 1, pageSize: 50 }, authToken }) => {
		const { page, pageSize } = paging	
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
	transactionPageCount: async (user, { pageSize = 50 }) => {
		const transactionCount = await Transaction.countDocuments({$or: [
			{
				sender: user.id
			},
			{
				recipient: user.id
			}
		]})
		const pageCount = Math.floor(transactionCount / pageSize) + (transactionCount % pageSize > 0 ? 1 : 0)
		return pageCount
	},

	posts: async (user, { paging = { page: 1, pageSize: 50 }}) => {
		const { page, pageSize } = paging
		const userPosts = await Content.find({submitted_by: user._id}).skip(pageSize * (page - 1)).limit(pageSize)
		return userPosts
	},
	postPageCount: async (user, { pageSize = 50 }) => {
		const postCount = await Content.countDocuments({submitted_by: user._id});
		const pageCount = Math.floor(postCount / pageSize) + (postCount % pageSize > 0 ? 1 : 0)
		return pageCount
	}
}

module.exports = {
	userSchema,
	User
}

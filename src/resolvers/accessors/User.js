const TransactionAPI = require('../../models/transaction')

const { QUEUE_FIELDS, USER_FIELDS } = require('../constants')

const User = {
	balanceEntries: async user => (await user.populate({path: 'balanceEntries.balance', select: QUEUE_FIELDS}).execPopulate()).balanceEntries,
	referredBy: async user => (await user.populate({path: 'referred_by', select: USER_FIELDS}).execPopulate()).referredBy,
	// TODO: added default params, make sure that typescript allows non-negative params in functions
	transactions: async (user, {page = 1, count = 50}) => {
		const size = await TransactionAPI.countDocuments({$or: [
			{
				sender: user.id
			},
			{
				recipient: user.id
			}
		]})
		const transactions = await TransactionAPI.find({$or: [
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

module.exports = User

const router = require('express').Router()

const Content = require('../models/content/content');
const Transaction = require('../models/transaction');


router.get('/posts', async (req, res) => {
	try {
		res.status(200).send('NYI')
	} catch (error) {
		res.status(400).send(error)
	}
})

router.get('/transactions', async (req, res) => {
	try {
		const user_id = 5 // req.user._id
		const transactions = await Transaction.find({$or: [
				{
					sender: user_id
				},
				{
					recipient: user_id
				}
			]})
	} catch (error) {
		res.status(400).send(error)
	}
})

module.exports = router
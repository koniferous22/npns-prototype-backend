const Problem = require('../models/content/problem');
const Submission = require('../models/content/submission')

const User = require('../models/user')
const Queue = require('../models/queue')
const Transaction = require('../models/transaction');

const { auth } = require('../middleware')

const router = require('express').Router()


/*
1.) Find challenge
2.) Verify problem can be boosted
3.) await update by concating into array (yandreyovi to nefachcalo)
*/
router.post('/:id/boost', auth, async function (req, res) {
	try {
		// AUTH:
		// TODO: refactor with auth: field submitted_by: should be only required parameter
		const user_id = req.user._id
		console.log(req.body)
		const problem = await Problem.findOne({_id:req.params.id})
		// problem.boost(user_id, req.body.value)
		//zialbohu kombinacia boost metody a save z neznamych pricin nefungovala, tak sa pouziva updateOne... btw save() som tu stale ponechal pre vypocet celkovej boost_value problemu

		// TODO: EXTERNAL SERVICES GO HERE
		if (problem.accepted_submission != null) {
			throw new Error({message:'Cannot boost solved problem'})
		}
		if (req.body.value <= 0) {
			throw new Error({message:'Boost value has to be positive'})
		}
		await Problem.updateOne(
			{_id:req.params.id},
			{
				$push: {
					boosts: {boosted_by: user_id, boost_value: req.body.value, paypal_order: req.body.order}
				}
			}
		)
		await problem.save((err, problem) => {}) //nutny callback
        res.status(200).send(problem)
	} catch (error) {
		res.status(400).send('aaaaaaaaaaaaaaa')
	}
})

module.exports = router;
	
const router = require('express').Router()
const _ = require('lodash')

const Content = require('../models/content/content');
const Transaction = require('../models/transaction');

// temp
const Queue = require('../models/queue');
const User = require('../models/user');

const Problem = require('../models/content/problem')
const Submission = require('../models/content/submission')
const Reply = require('../models/content/reply')
const { auth } = require('../middleware');

router.get('/posts', auth, async (req, res) => {
	try {
		// verify that transactions are sorted
		const page = (!req.query.page || req.query.page < 1) ? 1 : req.query.page
        const count = (!req.query.count || req.query.count < 1) ? 50 : req.query.count
		const user_id = req.user._id
		// AUTH
		// TODO:
		Content.find({submitted_by: user_id}).skip(count * (page - 1)).limit(count).populate(
		{
			path: 'problem submission submitted_by',
			populate: {
				path: 'problem submitted_by',
				populate: {
					path: 'submitted_by'
				}
			}
		}).exec((err, data) => {
			if (!err) {
				// TODO: separate file for query filters (so that shit can be later reused)
				//'_id title bounty view_count created submitted_by.username submission_count'
				const objectFieldsFilter = (({_id, title, bounty, view_count, created, submitted_by, submission_count, __t}) => ({_id, title, bounty, view_count, created, submitted_by:submitted_by.username, submission_count, __t}))
				//console.log(data)
				const result = data.map(entry => {
					switch (entry.__t){
						case 'Problem':
							return objectFieldsFilter(entry)
							break;
						case 'Submission':
							return objectFieldsFilter(entry.problem)
							break;
						case 'Reply':
							return objectFieldsFilter(entry.submission.problem)
							break;
						default:
							return {}
					}
				})
				// TODO: behaviour will be different, cause, 
				res.status(200).send(_.uniqWith(result, (x,y) => { return x._id.toString() == y._id.toString() }))
			} else {
				res.status(400).send(err)
			}
		})
	} catch (error) {
		res.status(400).send(error)
	}
})

router.get('/transactions', auth, async (req, res) => {
	try {
		// TODO: refactor
		// verify that transactions are sorted
		const page = (!req.query.page || req.query.page < 1) ? 1 : req.query.page
        const count = (!req.query.count || req.query.count < 1) ? 50 : req.query.count
		const user_id = req.user._id
		const transactions = await Transaction.find({$or: [
				{
					sender: user_id
				},
				{
					recipient: user_id
				}
			]}).skip(count * (page - 1)).limit(count)
		res.status(200).send(transactions)
	} catch (error) {
		res.status(400).send(error)
	}
})

router.post('/createTransaction', auth, async (req, res) => {
	try {
		const sender = (req.body.sender) ? (await User.find().byLogin(req.body.sender))._id : null
		const recipient = (req.body.recipient) ? (await User.find().byLogin(req.body.recipient))._id : null
		const queue = (req.body.queue) ? (await Queue.findOne({name:req.body.queue}))._id : null
		const transaction = new Transaction({
			...req.body,
			sender,
			recipient,
			queue
		})
		await transaction.save()
	} catch (error) {
		res.status(400).send(error)
	}
})

router.get('/:id', async (req, res) => {
	try {
		const user = await User.findOne({username: req.params.id})
		const problem_count = await Problem.countDocuments({submitted_by: user._id})
		const submission_count = await Submission.countDocuments({submitted_by: user._id})
		const reply_count = await Reply.countDocuments({submitted_by: user._id})
		res.status(200).send({firstName: user.firstName, lastName: user.lastName, email: user.email, problem_count, submission_count, reply_count})
	} catch (error) {
		res.status(400).send(error)
	}
})

module.exports = router
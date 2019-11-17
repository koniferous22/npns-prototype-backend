const Queue = require('../models/queue');
const Problem = require('../models/content/problem');
const User = require('../models/user');
const { auth } = require('../middleware');

const router = require('express').Router()

router.get('/all', async (req, res) => {
	try {
		queues = await Queue.find({}, '-_id name').sort({name: 'asc'})
		res.status(200).send({queues})
	} catch(error) {
		res.status(400).send(error)
	}
})

router.get('/hierarchy', async (req, res) => {
	try {
		hierarchy = await Queue.hierarchy()
		res.status(200).send({hierarchy:hierarchy})
	} catch(error) {
		res.status(400).send({error})
	}
})

router.post('/create', async (req,res) => {
	// TODO: make auth
	try {
		q = new Queue(req.body)
		await q.save()
		res.status(200).send(q)
	} catch (error) {
		res.status(400).send(error)
	}
	
});

router.get('/karmaValues', async (req, res) => {
	try {
   	nameAndKarma = await Queue.find({}, 'name karmaValue -_id') //nevracia _id 
		res.status(200).send(nameAndKarma)
	} catch(error) {
		res.status(400).send({error})
	}
})

router.get('/:name', async function(req,res) {
    try {
		q = await Queue.findOne({"name":req.params.name}, 'name _id')
		res.status(200).send(q)
	} catch (error) {
		res.status(400).send({error})
	}
});

// public cache
router.get('/:name/descendants', async (req, res) => {
	try {
		desc = await Queue.find().descendants({name:req.params.name},'name')
		res.status(200).send(desc)
	} catch (error) {
		res.status(400).send({error})
	}

});

router.get('/:name/ancestors', async (req, res) => {
	try {
		anc = await Queue.find().ancestors({name:req.params.name},'name')
		res.status(200).send(desc)
	} catch (error) {
		res.status(400).send({error})
	}	

});

router.get('/:name/problems', async (req, res) => {
	try {
		const page = (!req.query.page || req.query.page < 1) ? 1 : req.query.page
		const count = (!req.query.count || req.query.count < 1) ? 50 : req.query.count
		const box_query_mask = '_id title bounty view_count created submitted_by.username submission_count'
		desc = await Queue.find().descendants({name:req.params.name},'_id')
		desc = desc.map(x => x._id)
 
		const size = await Problem.find({
			active: true,
			queue:{
				$in: desc
			}
		}).countDocuments()
		const hasMore = (page * count) < size

		const problems = await Problem.find({
			active: true,
			queue:{
				$in: desc
			}
		}).sort({root_queue_value:'desc'}).skip(count * (page - 1)).limit(count).populate('submitted_by','username').lean().exec((err,data) => {
				if (err) {
					res.status(400).send(err)
					return
				}
				data.forEach(p => {
					if (p.submitted_by) {
						p.username = p.submitted_by.username
						p.bounty = 0.98 * p.boosts.reduce((acc,cv) => acc + cv.boost_value, 0)
						/*
							OK SRSLY HERE I GOT REALLY LAZY, CANNOT BE BOTHERED HOW TO SOLVE, THAT VIRTUAL STUFF CANNOT BE QUERIED IN MONGOOSE LIKE SRSLY
						*/
					}

					delete p.submitted_by
				})
				res.status(200).send({data, hasMore})
			})
			
		
	} catch (error) {
		res.status(400).send({error})
	}	
})

router.get('/:name/user_count', async (req, res) => {
	try {
		const queue = await Queue.findOne({name:req.params.name},'_id');
		const balance_specifier = 'balances.' + queue._id
		const body_count = await User.find({[balance_specifier] : { $exists: true }},'username ' + balance_specifier).countDocuments()
		res.status(200).send({body_count})
	} catch (error) {
		res.status(400).send({error})
	}
})

router.get('/:name/scoreboard', async (req, res) => {
	try {
		const page = (!req.query.page || req.query.page < 1) ? 1 : req.query.page
		const count = (!req.query.count || req.query.count < 1) ? 50 : req.query.count
		const queue = await Queue.findOne({name:req.params.name},'_id');
		const balance_specifier = 'balances.' + queue._id
		const sort_params = { [balance_specifier]: 'desc' }
		const users = await User.find({[balance_specifier]: { $exists: true }},'username email ' + balance_specifier).sort(sort_params).skip(count * (page - 1)).limit(count).exec((err, users) => {
			if (err) {
				res.status(400).send({err})
			}
			const projection = (user) => ({username: user.username, [req.params.name]: user.balances.get(queue._id.toString())})
			const data = users.map(x => projection(x))
			return res.status(200).send({data})
		})
	} catch (error) {
		res.status(400).send({error})
	}
})

router.get('/:name/position/:problem', async (req, res) => {
	try {
		let desc = await Queue.find().descendants({name:req.params.name},'_id')
		desc = desc.map(x => x._id)
 
		const problem = await Problem.findOne({_id: req.params.problem})
		const position = (desc.includes(problem.queue)) ? await Problem.find({
			queue:{
				$in: desc
			},
			root_queue_value: {
				$gte: problem.root_queue_value
			}
		}).countDocuments() : null
		res.status(200).send({queue: queue.name, problem: req.params.problem, position})
	} catch (error) {
		res.status(400).send({error})
	}
		
})

router.get('/:name/scoreboard/position/:user', async (req, res) => {
	try {
		const queue = await Queue.findOne({name:req.params.name},'_id');
		const user = await User.findOne().byLogin(req.params.user)
		const userQueueScore = user.balances.get(queue._id.toString())
		const balance_specifier = 'balances.' + queue._id
		const position = (user.balances.get(queue._id.toString())) ? await User.find({[balance_specifier] : {$gte: userQueueScore}}).countDocuments() : null 
		res.status(200).send({queue: queue.name, user: req.params.user, position})
	} catch (error) {
		res.status(400).send({error})
	}
		
})

module.exports = router

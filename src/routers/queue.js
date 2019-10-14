const Queue = require('../models/queue');
const Problem = require('../models/content/problem');
const User = require('../models/user');
const { auth } = require('../middleware');

const router = require('express').Router()

router.get('/hierarchy', async (req, res) => {
	try {
		hierarchy = await Queue.hierarchy()
		res.status(200).send({hierarchy:hierarchy})
	} catch(error) {
		res.status(400).send(error)
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

router.get('/:name', async function(req,res) {
    try {
		q = await Queue.findOne({"name":req.params.name}, 'name _id')
		res.status(200).send(q)
	} catch (error) {
		res.status(400).send(error)
	}
});

// public cache
router.get('/:name/descendants', async (req, res) => {
	try {
		desc = await Queue.find().descendants({name:req.params.name},'name')
		res.status(200).send(desc)
	} catch (error) {
		res.status(400).send(error)
	}

});

router.get('/:name/ancestors', async (req, res) => {
	try {
		anc = await Queue.find().ancestors({name:req.params.name},'name')
		res.status(200).send(desc)
	} catch (error) {
		res.status(400).send(error)
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
			queue:{
				$in: desc
			}
		}).countDocuments()
		const hasMore = (page * count) < size

		const problems = await Problem.find({
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
					}
					delete p.submitted_by
				})
				res.status(200).send({data, hasMore})
			})
			
		
	} catch (error) {
		res.status(400).send(error)
	}	
})

router.get('/:name/scoreboard', async (req, res) => {
	try {
		const page = (!req.query.page || req.query.page < 1) ? 1 : req.query.page
		const count = (!req.query.count || req.query.count < 1) ? 50 : req.query.count
		const queue = await Queue.findOne({name:req.params.name},'_id');
		const balance_specifier = 'balances.' + queue._id
		const sort_params = {}
		sort_params[balance_specifier] = 'desc'
		const users = await User.find({},'username ' + balance_specifier).sort(sort_params).skip(count * (page - 1)).limit(count)
		res.status(200).send(users)
	} catch (error) {
		res.status(400).send(error)
	}
})

router.get('/economy/karmaValues', auth, async (req, res) => {
	try {
   	nameAndKarma = await Queue.find({}, 'name karmaValue -_id') //nevracia _id 
		res.status(200).send(nameAndKarma)
	} catch(error) {
		res.status(400).send(error)
	}
})


module.exports = router

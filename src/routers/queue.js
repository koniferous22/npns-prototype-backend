const Queue = require('../models/queue');
const Problem = require('../models/content/problem')

const { body, param, validationResult } = require('express-validator/check');

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
	// use old school code, cause incompatible with ES6
	try {
		desc = await Queue.find().descendants({name:req.params.name},'name')
		res.status(200).send(desc)
	} catch (error) {
		res.status(400).send(error)
	}

});

router.get('/:name/ancestors', async (req, res) => {
	try {
		//console.log()
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
		// add solution count
		const box_query_mask = '_id title bounty view_count created submitted_by.username' // submission_count
		desc = await Queue.find().descendants({name:req.params.name},'_id')
		desc = desc.map(x => x._id)

		problems = await Problem.find(
				{
					queue_id:{
						$in: desc
					}
				},
				box_query_mask
			).sort({rootQueueValue:'desc'}).skip(count * (page - 1)).limit(count).populate('submitted_by','username').lean().exec((err,data) => {
				if (err) {
					res.status(400).send(err)
					return
				}
				data.forEach(p => {
					// remove _id from request results
					p.username = p.submitted_by.username
					delete p.submitted_by
				})	
				res.status(200).send(data)
			})
			
		
	} catch (error) {
		res.status(400).send(error)
	}	
})

module.exports = router
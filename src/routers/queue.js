const Queue = require('../models/queue');
const Problem = require('../models/problem')

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
		const page = req.query.page || 1
		const count = req.query.count || 50
		// add solution count
		const box_query_mask = '_id title bounty view_count created submission_count'
		desc = await Queue.find().descendants({name:req.params.name},'_id')
		desc = desc.map(x => x._id)

		problems = await Problem.find(
				{
					queue_id:{
						$in: desc
					}
				},
				box_query_mask
			).limit(count)
		res.status(200).send(problems)
	} catch (error) {
		res.status(400).send(error)
	}	
})

module.exports = router
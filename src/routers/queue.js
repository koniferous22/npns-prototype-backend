const Queue = require('../models/queue');
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
		q = await Queue.findOne({"name":req.params.name}, {name:1})
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

module.exports = router
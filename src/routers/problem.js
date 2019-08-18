const Problem = require('../models/problem');
const User = require('../models/user')
const Queue = require('../models/queue')

const { body, param, validationResult } = require('express-validator/check');
const { auth } = require('../middleware')

const router = require('express').Router()

router.post('/add', /*auth, */ async function (req, res) {
	try {
        problem = req.body;
        q = await Queue.findOne({name:problem.queue_name}, '_id')
        if (!q) {
            throw new Error({message:'NO QUEUE FOUND'})
        }
        problem = new Problem({...problem, queue_id:q._id })
        console.log(problem.calculateProblemValue())
		await problem.save();
		res.status(200).send(problem)
	} catch (error){
		res.status(400).send(error)
	}
});

router.get('/:queue_id/:page', function(req,res,next) {
        // define paging response
        Problem.find({queueId: req.params.id}, function(err, problemz) {
        if (err) {
            next(err);
        } else {
            res.set('Content-type','application/json');
            res.send(problemz);
        }
    });
});


router.get('/problem/:id', [
            param('id').isMongoId()
        ], function(req,res,next) {
        Problem.find({_id: req.params.id}, function(err, problem) {
        if (err) {
            next(err);
        } else {
            res.set('Content-type','application/json');
            res.send(problem);
        }
    });
});


module.exports = router;
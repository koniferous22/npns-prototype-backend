const Problem = require('../models/problem');
const User = require('../models/user')

const { body, param, validationResult } = require('express-validator/check');
const { auth } = require('../middleware')

const router = require('express').Router()

router.post('/add', auth, async (req, res, next) => {
	try {
		problem = new Problem(req.body);
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
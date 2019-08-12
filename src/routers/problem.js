const Problem = require('../models/problem');
const { body, param, validationResult } = require('express-validator/check');

const router = require('express').Router()

router.post('/add', (req, res, next) => {
	const { body } = req;
	let { queueId } = body;  /* queueId a userId sa musia pridavat automaticky... dorobit vo frontende*/
	let { userId } = body;
	let { title } = body;
	let { description } = body;
	
	if (!title) {
		return res.send({
			success: false,
			message: 'Error: Title cannot be blank.'
		});
	}

	title = title.trim();

		// Save the new problem
		const newProblem = new Problem();
		newProblem.queueId = queueId;
		newProblem.userId = userId;
		newProblem.title = title;
		newProblem.description = description;
		newProblem.save((err, problem) => {
			if (err) {
				return res.send({
					success: false,
					message: 'Error: Server error'
				});
			}
			return res.send({
				success: true,
				message: 'Problem created'
			});
		});
	});

router.get('/allinqueue/:id', function(req,res,next) {
        Problem.find({queueId: req.params.id}, function(err, problemz) {
        if (err) {
            next(err);
        } else {
            res.set('Content-type','application/json');
            res.send(problemz);
        }
    });
});

router.get('/userproblems/:userid', function(req,res,next) {
        Problem.find({userId: req.params.userid}, function(err, problemz) {
        if (err) {
            next(err);
        } else {
            res.set('Content-type','application/json');
            res.send(problemz);
        }
    });
});


router.get('/:id', [
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
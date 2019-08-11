const router = require('express').Router()
const Submission = require('../models/submission');
const { body, param, validationResult } = require('express-validator/check');


router.post('/add', (req, res, next) => {
	const { body } = req;
	let { problemId } = body;  /* problemId a userId sa musia pridavat automaticky... dorobit vo frontende*/
	let { userId } = body;
	let { title } = body;
	let { description } = body;
	
	if (!description) {
		return res.send({
			success: false,
			message: 'Error: Description cannot be blank.'
		});
	}

		// Save the new submission
		const newSubmission = new Submission();
		newSubmission.problemId = problemId;
		newSubmission.userId = userId;
		newSubmission.description = description;
		newSubmission.save((err, submission) => {
			if (err) {
				return res.send({
					success: false,
					message: 'Error: Server error'
				});
			}
			return res.send({
				success: true,
				message: 'Submission created'
			});
		});
	});


router.get('/:id', [
            param('id').isMongoId()
        ], function(req,res,next) {
        Submission.find({_id: req.params.id}, function(err, submission) {
        if (err) {
            next(err);
        } else {
            res.set('Content-type','application/json');
            res.send(submission);
        }
    });
});


module.exports = router;

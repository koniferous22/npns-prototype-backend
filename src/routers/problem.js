const Problem = require('../models/content/problem');
const Submission = require('../models/content/submission')

const User = require('../models/user')
const Queue = require('../models/queue')
const Transaction = require('../models/transaction');

const { auth } = require('../middleware')

const router = require('express').Router()

router.post('/add', auth, async function (req, res) {
	try {
		// AUTH:
        // TODO: refactor with auth: field submitted_by
        problem = req.body;
        q = await Queue.findOne({name:problem.queue_name}, '_id')
        if (!q) {
            throw new Error({message:'NO QUEUE FOUND'})
        }
        problem = new Problem({...problem, queue:q._id })
		await problem.save();
		res.status(200).send(problem)
	} catch (error){
		res.status(400).send(error)
	}
});

router.get('/:id', async function(req,res) {
    try {
        problem = await Problem.viewProblem(req.params.id)
        res.status(200).send(problem)
    } catch (error) {
        res.status(400).send(error)
    }
});

router.post('/:id/submit', auth,  async function(req,res) {
    try {
        // AUTH:
        // TODO: refactor with auth: field submitted_by: should be only required parameter
        const user_id = req.user._id
        const submission = new Submission({ ...req.body, submitted_by: user_id, problem: req.params.id })
        await submission.save()
        await Problem.updateOne(
        	{_id:req.params.id},
        	{
        		$push: {
        			submissions: {submission: submission._id}
        		}
        	}
        	)
        res.status(200).send(submission)
    } catch (error) {
        res.status(400).send(error)
    }
});

router.post('/:id/mark_solved', auth, async function (req, res) {
	try {
		const problem = await Problem.findOne({_id:req.params.id})
		// AUTH:
		// TODO: Reimplment with auth middleware
		const user_id = req.user._id
		if (problem.submitted_by != user_id) {
			return res.status(401).send('You are not the problem owner')
		}
		const submission = await Submission.findOne({_id:req.body.submission});

		problem.acceptSubmission(submission._id);
		const transaction = new Transaction({
			recipient: user_id,
			queue: problem.queue,
			karma_value: 1,
			monetary_value: problem.boost_value,
			description: 'Correct solution reward'
		})
		await problem.save()
		await User.findOne({_id:submission.submitted_by}).exec((err, user) => {
			user.addBalance(problem.queue, transaction.karma_value)
		});
		await transaction.save()
	} catch (error) {
		res.status(400).send('lol nepreslo')
	}
})

router.get('/:id/submissions', async function (req, res) {
    try {
        const page = (!req.query.page || req.query.page < 1) ? 1 : req.query.page
        const count = (!req.query.count || req.query.count < 1) ? 50 : req.query.count
        const submissions = await Submission.find({problem:req.params.id, active: true}).skip(count * (page - 1)).limit(count)
        const problem = await Problem.findOne({_id:req.params.id})
        const hasMore = (page * count) < problem.submissions.length
        res.status(200).send({data:submissions, hasMore})
    } catch (error) {
        res.status(400).send('looool')
    }
})

router.post('/:id/boost', auth, async function (req, res) {
    try {
        // AUTH:
        // TODO: refactor with auth: field submitted_by: should be only required parameter
        const user_id = req.user._id
        const problem = await Problem.findOne({_id:req.params.id})
        problem.boost(user_id, req.body.value)
        // TODO: EXTERNAL SERVICES GO HERE
        await problem.save()
    } catch (error) {
        res.status(400).send('aaaaaaaaaaaaaaa')   
    }
})

module.exports = router;

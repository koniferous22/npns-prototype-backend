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
        problem = {...req.body,  submitted_by: req.user._id};
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
		const problem = await Problem.findOne({_id:req.params.id, submitted_by: req.user._id})
		// AUTH:
		// TODO: Reimplment with auth middleware
		const user_id = req.user._id
        const problem_owner = problem.submitted_by
        // Have to use mongoose id equals method, otherwise string-wise comparision simply fails xD
		if (!user_id.equals(problem_owner)) {
			return res.status(401).send('You are not the problem owner')
		}
		const submission = await Submission.findOne({_id:req.body.submission});
		problem.acceptSolution(submission._id);
		const transaction = new Transaction({
			recipient: submission.submitted_by,
			queue: problem.queue,
			karma_value: 1,
			monetary_value: problem.boost_value,
			description: 'Correct solution reward form problem ' + problem._id
		})
		const winner = await User.findOne({_id:submission.submitted_by})
        const ancestors = await Queue.find().ancestors({_id: problem.queue}, '_id')
        ancestors.push({_id: problem.queue})
        ancestors.forEach(ancestor => {
            winner.addBalance(ancestor._id.toString() /*has to convert to string*/, transaction.karma_value)            
        })

        await problem.save()
        await transaction.save()
        await winner.save()
        res.status(200).send(transaction)
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
		// problem.boost(user_id, req.body.value)
		//zialbohu kombinacia boost metody a save z neznamych pricin nefungovala, tak sa pouziva updateOne... btw save() som tu stale ponechal pre vypocet celkovej boost_value problemu

		// TODO: EXTERNAL SERVICES GO HERE
		if (problem.accepted_submission != null) {
			throw new Error({message:'Cannot boost solved problem'})
		}
		await Problem.updateOne(
			{_id:req.params.id},
			{
				$push: {
					boosts: {boosted_by: user_id, boost_value: req.body.value}
				}
			}
			)
await problem.save((err, problem) => {}) //nutny callback
res.status(200).send(problem)
	} catch (error) {
		res.status(400).send('aaaaaaaaaaaaaaa')   
	}
})

module.exports = router;

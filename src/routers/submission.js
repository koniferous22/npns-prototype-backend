const router = require('express').Router()
const Submission = require('../models/content/submission');
const Reply = require('../models/content/reply')

const { auth } = require('../middleware')

router.get('/:id', async function(req,res) {
    try {
        submission = await Submission.findOne({_id:req.params.id})
        res.status(200).send(submission)
    } catch (error) {
        res.status(400).send(error)
    }
});

router.post('/:id/reply', auth, async function(req, res) {
	try {
        // refactor with auth: field submitted_by: should be only required parameter
        // TODO:
        // AUTH
        const user_id = req.user.id
        const reply = new Reply({ ...req.body, submitted_by: user_id, submission: req.params.id })
        await reply.save()
        await Submission.updateOne(
        	{_id:req.params.id},
        	{
        		$push: {
        			replies: {
                        reply: reply._id
                    },
        		}
        	}
        	)
        res.status(200).send(reply)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/:id/replies', async function (req, res) {
    try {
        const page = (!req.query.page || req.query.page < 1) ? 1 : req.query.page
        const count = (!req.query.count || req.query.count < 1) ? 50 : req.query.count
        const submission = await Submission.findOne({_id:req.params.id})
        const replies = await Reply.find({submission:req.params.id, active: true}).skip(count * (page - 1)).limit(count)
        const hasMore = (page * count) < submission.replies.length        
        res.status(200).send({data: replies, hasMore})
    } catch (error) {
        res.status(400).send('looool')
    }
})

// TODO: Get replies page

module.exports = router;

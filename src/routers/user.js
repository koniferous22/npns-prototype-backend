const router = require('express').Router()
const _ = require('lodash')

const Content = require('../models/content/content');
const Transaction = require('../models/transaction');

const Queue = require('../models/queue');
const User = require('../models/user');

const Problem = require('../models/content/problem')
const Submission = require('../models/content/submission')
const Reply = require('../models/content/reply')
const { auth } = require('../middleware');

const AuthToken = require('../models/auth_token')

const PasswordResetToken = require('../models/verification_token/password_reset');
const EmailChangeToken = require('../models/verification_token/email_change');
const VerificationToken = require('../models/verification_token/verification_token');

const { pwdResetTemplate, emailChangeTemplate } = require('../nodemailer/templates');

router.get('/posts', auth, async (req, res) => {
	try {
		// verify that transactions are sorted
		const page = (!req.query.page || req.query.page < 1) ? 1 : req.query.page
        const count = (!req.query.count || req.query.count < 1) ? 50 : req.query.count
		const user_id = req.user._id
		// AUTH
		// TODO:
		Content.find({submitted_by: user_id}).skip(count * (page - 1)).limit(count).populate(
		{
			path: 'problem submission submitted_by',
			populate: {
				path: 'problem submitted_by',
				populate: {
					path: 'submitted_by'
				}
			}
		}).exec((err, data) => {
			if (!err) {
				// TODO: separate file for query filters (so that shit can be later reused)
				//'_id title bounty view_count created submitted_by.username submission_count'
				const objectFieldsFilter = (({_id, title, bounty, view_count, created, submitted_by, submission_count, __t}) => ({_id, title, bounty, view_count, created, submitted_by:submitted_by.username, submission_count, __t}))
				const result = data.map(entry => {
					switch (entry.__t){
						case 'Problem':
							return objectFieldsFilter(entry)
							break;
						case 'Submission':
							return objectFieldsFilter(entry.problem)
							break;
						case 'Reply':
							return objectFieldsFilter(entry.submission.problem)
							break;
						default:
							return {}
					}
				})
				// TODO: behaviour will be different, cause, 
				res.status(200).send(_.uniqWith(result, (x,y) => { return x._id.toString() == y._id.toString() }))
			} else {
				res.status(400).json({error:err})
			}
		})
	} catch (error) {
		res.status(400).json({error})
	}
})

router.get('/transactions', auth, async (req, res) => {
	try {
		// TODO: refactor
		// verify that transactions are sorted
		const page = (!req.query.page || req.query.page < 1) ? 1 : req.query.page
        const count = (!req.query.count || req.query.count < 1) ? 50 : req.query.count
		const user_id = req.user._id
		const transactions = await Transaction.find({$or: [
				{
					sender: user_id
				},
				{
					recipient: user_id
				}
			]}).skip(count * (page - 1)).limit(count)
		res.status(200).send(transactions)
	} catch (error) {
		res.status(400).json({error})
	}
})

router.post('/createTransaction', auth, async (req, res) => {
	try {
		const sender = (req.body.sender) ? (await User.find().byLogin(req.body.sender))._id : null
		const recipient = (req.body.recipient) ? (await User.find().byLogin(req.body.recipient))._id : null
		const queue = (req.body.queue) ? (await Queue.findOne({name:req.body.queue}))._id : null
		const transaction = new Transaction({
			...req.body,
			sender,
			recipient,
			queue
		})
		await transaction.save()
	} catch (error) {
		res.status(400).json({error})
	}
})

router.get('/:id', async (req, res) => {
	try {
		const user = await User.findOne({username: req.params.id})
		const problem_count = await Problem.countDocuments({submitted_by: user._id})
		const submission_count = await Submission.countDocuments({submitted_by: user._id})
		const reply_count = await Reply.countDocuments({submitted_by: user._id})
		res.status(200).send({firstName: user.firstName, lastName: user.lastName, email: user.email, problem_count, submission_count, reply_count})
	} catch (error) {
		res.status(400).json({error})
	}
})


router.post('/emailChange', auth, async (req, res) => {
    try {
        const newEmail = req.body.email
        const token = new EmailChangeToken({user: req.user._id, newEmail})
        await token.save()
        await user.sendEmail(emailChangeTemplate, {token: token.token})
        res.status(200).send({message:"Email change requested"})
    } catch (error) {
        res.status(500).send({message: error})
    }
})

router.post('/passwordReset/request', async (req, res) => {
    try {
        const user = await User.find().byLogin(req.body.user)
        if (!user) {
            return res.status(400).json({message:'No User found'})
        }
        const token = new PasswordResetToken({user})
        await token.save()
        await user.sendEmail(pwdResetTemplate, {token: token.token})
        res.status(200).send({message:"Password reset email sent", user})
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/passwordReset/confirm', async (req, res) => {
    try {
        const password_reset_token = await PasswordResetToken.findOne({token: req.body.emailToken})
        const user = await User.findOne({_id: password_reset_token.user})
        // could not be bothered, pre update event handler doesnt work, sorry you have to witness this
        user.password = req.body.password
        await user.save()

        // deletes all other operations
        await VerificationToken.deleteMany({user:user._id})
        // logs out user in order to confirm the changes
        await AuthToken.deleteMany({user:user._id})
        
        res.status(200).send('Password updated')
    } catch(error) {
        res.status(400).send(error)
    }
})



module.exports = router
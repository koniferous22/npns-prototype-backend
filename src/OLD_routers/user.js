const router = require('express').Router()
const _ = require('lodash')

const Content = require('../models/content/content');
const Transaction = require('../models/transaction');

const Queue = require('../models/queue')	;
const User = require('../models/user');

const Problem = require('../models/content/problem')
const Submission = require('../models/content/submission')
const Reply = require('../models/content/reply')
const { auth } = require('../middleware');

const AuthToken = require('../models/auth_token')

const PasswordResetToken = require('../models/verification_token/password_reset');
const EmailChangeToken = require('../models/verification_token/email_change');
const UsernameChangeToken = require('../models/verification_token/username_change');
const VerificationToken = require('../models/verification_token/verification_token');

const { pwdResetTemplate, emailChangeTemplate, usernameChangeTemplate } = require('../nodemailer/templates');

router.post('/emailChange', auth, async (req, res) => {
    try {
        const newEmail = req.body.newEmail
        const token = new EmailChangeToken({user: req.user._id, newEmail})
        await token.save()
        await user.sendEmail(emailChangeTemplate, {token: token.token, email: newEmail})
        res.status(200).send({message:"Email change requested"})
    } catch (error) {
        console.log(error)
        res.status(500).send({message: error})
    }
})

router.post('/usernameChange', auth, async (req, res) => {
    try {
        const newUsername = req.body.newUsername
        const token = new UsernameChangeToken({user: req.user._id, newUsername})
        await token.save()
        await user.sendEmail(usernameChangeTemplate, {token: token.token})
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

router.post('/namesChange', auth, async (req, res) => {
    try {
        const user = req.user
        user.firstName = req.body.newFirstName || user.firstName
        user.lastName = req.body.newLastName || user.lastName
        await user.save()
        res.status(200).send('Password updated')
    } catch(error) {
        res.status(400).send(error)
    }
})

router.post('/exists', async (req, res) => {
	try {
		const user = await User.findOne().byLogin(req.body.user)
		if (!user) {
			return res.status(400).send({exists:false})
		}
		return res.status(200).send({exists:true})
	} catch (error) {
		res.status(400).json({error})
	}
})

module.exports = router

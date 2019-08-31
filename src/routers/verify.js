const router = require('express').Router();

const User = require('../models/user')
const VerificationToken = require('../models/verification_token/verification_token');
const PasswordResetToken = require('../models/verification_token/password_reset');
const EmailChangeToken = require('../models/verification_token/email_change');

const { signupTemplate } = require('../nodemailer/templates')

router.post('/registration', async (req, res) => {
    try {
        const verification_token = await VerificationToken.findOne({token: req.body.emailToken})
        const user = await User.findOne({_id: verification_token.user})
        user.setVerifiedFlag()
        await user.save()
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/registration/resend', async (req, res) => {
    try {
        const user = await User.find().byLogin(req.body.username)
        if (user.verified) {
            throw new Error({error:'User already verified'})
        }
        // this should delete all other oprations as well
        await VerificationToken.deleteMany({user:user._id})
        const token = new VerificationToken({user: user._id})
        await token.save()
        const mailInfo = await user.sendEmail(signupTemplate, {token})
        res.status(200).send(mailInfo)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/newPassword', async(req, res) => {
    try {
    	const password_reset_token = await PasswordResetToken.findOne({token: req.body.emailToken})
    	await User.updateOne({_id: verification_token.user}, {password:password_reset_token.newPassword})
        res.status(200).send('Password updated')
    } catch {
        res.status(400).send(error)
    }
    
})

router.post('/newEmail', async(req, res) => {
    try {
        const email_change_token = await EmailChangeToken.findOne({token: req.body.emailToken})
        await User.updateOne({_id: verification_token.user}, {email:email_change_token.newEmail})
        res.status(200).send('Email updated')
    } catch {
        res.status(400).send(error)
    }
})

module.exports = router
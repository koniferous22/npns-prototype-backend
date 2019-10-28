const router = require('express').Router();

const AuthToken = require('../models/auth_token')
const User = require('../models/user')
const VerificationToken = require('../models/verification_token/verification_token');
const PasswordResetToken = require('../models/verification_token/password_reset');
const EmailChangeToken = require('../models/verification_token/email_change');
const UsernameChangeToken = require('../models/verification_token/username_change');

const { signupTemplate } = require('../nodemailer/templates')

const { auth } = require('../middleware');

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
            throw {message:'User already verified'}
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

router.post('/newPasswordRequest', async(req, res) => {
    try {
    	const password_reset_token = await PasswordResetToken.findOne({token: req.body.emailToken})
        if (password_reset_token) {
    	   return res.status(200).send('Email token valid')
        } else {
            return res.status(400).send({message:'Invalid token'})
        }
    } catch (error) {
        res.status(400).send({message:'Invalid token'})
    }
    
})

router.post('/newEmail', async(req, res) => {
    try {
        const email_change_token = await EmailChangeToken.findOne({token: req.body.emailToken})
        await User.updateOne({_id: email_change_token.user}, {email:email_change_token.newEmail})
        // deletes all other operations
        await VerificationToken.deleteMany({user:email_change_token.user})
        // logs out user in order to confirm the changes
        await AuthToken.deleteMany({user:email_change_token.user})
        res.status(200).send('Email updated')
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/newUsername', async(req, res) => {
    try {
        const username_change_token = await UsernameChangeToken.findOne({token: req.body.emailToken})
        await User.updateOne({_id: username_change_token.user}, {username:username_change_token.newUsername})
        // deletes all other operations
        await VerificationToken.deleteMany({user:username_change_token.user})
        // logs out user in order to confirm the changes
        await AuthToken.deleteMany({user:username_change_token.user})
        res.status(200).send('Username updated')
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/login', auth, async (req, res) => {
    // just verifies if user is logged in
    res.status(200).send({user: req.user, token: req.token.token})
})

module.exports = router
const router = require('express').Router();

const User = require('../models/user')
const VerificationToken = require('../models/verification_token/verification_token');
const PasswordResetToken = require('../models/verification_token/password_reset');
const EmailChangeToken = require('../models/verification_token/email_change');
const UsernameChangeToken = require('../models/verification_token/username_change');

const { signupTemplate } = require('../nodemailer/templates')

const { auth } = require('../middleware');

router.post('/registration/resend', async (req, res) => {
    try {
        const user = await User.find().byLogin(req.body.username)
        if (user.verified) {
            throw {message:'User already verified'}
        }
        // this should delete all other oprations as well
        await VerificationToken.deleteMany({user:user._id})
        const token = new VerificationToken({user: user._id})
        await token.save(() => {})
        const mailInfo = await user.sendEmail(signupTemplate, {token})
        res.status(200).send(mailInfo)
    } catch (error) {
        res.status(500).send(error)
    }
})

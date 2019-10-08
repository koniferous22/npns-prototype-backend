const User = require('../models/user');
const AuthToken = require('../models/auth_token')
const VerificationToken = require('../models/verification_token/verification_token');
const PasswordResetToken = require('../models/verification_token/password_reset');


const { signupTemplate,pwdResetTemplate } = require('../nodemailer/templates');

const { auth } = require('../middleware');


const router = require('express').Router();


router.post('/signup', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = new VerificationToken({user: user._id})
        await token.save((err,data) => {})
        //bez callbacku zlyhavali registracie
        const mailInfo = await user.sendEmail(signupTemplate, {token: token.token})
    	res.status(200).send({
    		user,
    		mailInfo
    	})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/signin', async (req, res) => {
	try {
        const { username, email, password } = req.body
        const user = await User.find().byCredentials(username || email, password)

        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        if (!user.verified) {
            return res.status(401).send({error: 'not verified, check your email'})
        }
        token = await AuthToken.generate(user._id)
        res.status(200).send({ user, token: token.token })
    } catch (error) {   
        res.status(400).send(error)
    }
});

router.post('/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        await AuthToken.deleteOne(req.token)
        /*req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()*/
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        await AuthToken.deleteMany({user: req.user._id})
        /*req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()*/
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/passwordReset', async (req, res) => {
    try {
        const token = new PasswordResetToken(req.body)
        await token.save()
        const user = await User.findOne({_id: token.user })
        await user.sendEmail(pwdResetTemplate, {token: token.token})
        res.status(200)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router

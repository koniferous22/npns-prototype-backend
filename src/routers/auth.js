const User = require('../models/user');
const VerificationToken = require('../models/verification_token');

const { auth } = require('../middleware');


const router = require('express').Router();

router.get('/', (req,res,next) => {
	res.send({msg: "NYI"})
})

router.post('/signup', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = new VerificationToken({userId: user._id})
        await token.save()
        const mailInfo = await user.sendSignupEmail(token)
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
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (error) {   
        res.status(400).send(error)
    }
});

router.post('/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router
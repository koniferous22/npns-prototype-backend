const User = require('../models/user');
const AuthToken = require('../models/auth_token')
const VerificationToken = require('../models/verification_token/verification_token');

const { signupTemplate } = require('../nodemailer/templates');
const { auth } = require('../middleware');

const router = require('express').Router();

router.post('/confirmPassword', auth, async (req, res) => {
	 try {
			user = req.user
			const hasValidPassword = await user.validPassword(req.body.password)
			if (!hasValidPassword) {
					throw {message:'Invalid password'}
			}
			res.status(200).send({ user })
	} catch (error) {		
			res.status(400).send(error)
	} 
});

module.exports = router

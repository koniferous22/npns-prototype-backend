const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');

const User = require('../models/user');

const { auth } = require('../middleware');


router.post('/username', async (req, res) => {
	try {
		if (!req.body.username || req.body.username === '') {
			return res.status(400).send({message:'No username submitted'})
		}
		const user_with_username = await User.find({username: req.body.username}).limit(1)
		if (user_with_username.length > 0) {
			return res.status(400).send({message:'Username taken'})
		}
		return res.status(200).send({message:'Username free'})
	} catch (error) {
		res.status(400).send(error)
	}
})

router.post('/email', check('email').isEmail() , async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).send({message: 'Invalid format bruh'})
		}
		// NOT CHECKING THE EMAIL FORMAT
		const user_with_email = await User.find({email: req.body.email}).limit(1)
		if (user_with_email.length > 0) {
			return res.status(400).send({message:'Email taken'})
		}
		return res.status(200).send({message:'Email free'})
	} catch (error) {
		return res.status(400).send(error)
	}
})


router.post('/password', async (req, res) => {
	// OK HERE I GOT REALLY LAZY
	if (!req.body.password) {
		return res.status(400).send({message:'No password'})
	}
	if (req.body.password.length < 8) {
		return res.status(400).send({message:'Too short'})
	}
	return res.status(200).send({message:"yes"})
})

router.post('/passwordChange', auth, async (req, res) => {
	try {	
		const dupl_user = new User(req.user)
		dupl_user.password = req.body.password
		error = dupl_user.validateSync()
		if (error) {
			return res.status(400).send(error)
		}
		const passwordSame = await req.user.validPassword(req.body.password);
		if (!passwordSame) {
			return res.status(400).send({message:'Password is same as previous one'})
		}
		return res.status(200).send({message:'Password available'})
	} catch(error) {
		return res.status(400).json({error})
	}
})

module.exports = router
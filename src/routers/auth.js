
const User = require('../models/user');
const UserSession = require('../models/userSession');


module.exports = (passport) => {
	const router = require('express').Router()

	router.get('/', (req,res,next) => {
		res.send({msg: "NYI"})
	})

	router.post('/signup', (req, res, next) => {
		const { body } = req;
		const {
			password
		} = body;
		let {
			username
		} = body;
		let {
			email
		} = body;
		let {
			firstName
		} = body;
		let {
			lastName
		} = body;
		
		if (!username) {
			return res.send({
				success: false,
				message: 'Error: Username cannot be blank.'
			});
		}
		if (!password) {
			return res.send({
				success: false,
				message: 'Error: Password cannot be blank.'
			});
		}

		username = username.toLowerCase();
		username = username.trim();

		// Steps:
		// 1. Verify username doesn't exist
		// 2. Save
		User.find({
			username: username
		}, (err, previousUsers) => {
			if (err) {
				return res.send({
					success: false,
					message: 'Error: Server error'
				});
			} else if (previousUsers.length > 0) {
				return res.send({
					success: false,
					message: 'Error: Account already exist.'
				});
			}

			// Save the new user
			const newUser = new User();

			newUser.username = username;
			newUser.password = newUser.generateHash(password);
			newUser.email = email;
			newUser.firstName = firstName;
			newUser.lastName = lastName;
			newUser.save((err, user) => {
				if (err) {
					return res.send({
						success: false,
						message: 'Error: Server error'
					});
				}
				return res.send({
					success: true,
					message: 'Signed up'
				});
			});
		});

	});

	router.post('/logen',
		passport.authenticate('local' /*,{ failureRedirect: '/loginFailure' }*/),
		(req, res) => {
			res.status(200)
		})


	router.post('/signin', (req, res, next) => {
		const { body } = req;
		const {
			password
		} = body;
		let {
			username
		} = body;

		if (!username) {
			return res.status(404).send({
				success: false,
				message: 'Error: Username cannot be blank.'
			});
		}
		if (!password) {
			return res.status(404).send({
				success: false,
				message: 'Error: Password cannot be blank.'
			});
		}

		username = username.toLowerCase();
		username = username.trim();

		console.log("username: " + username)
		User.find({
			username: username
		}, (err, users) => {
			if (err) {
				return res.status(500).send({
					success: false,
					message: 'Error: server error'
				});
			}
			if (users.length != 1) {
				return res.status(404).send({
					success: false,
					message: 'Error: Invalid'
				});
			}

			const user = users[0];
			if (!user.validPassword(password)) {
				return res.status(401).send({
					success: false,
					message: 'Error: Invalid password'
				});
			}

			// Otherwise correct user
			const userSession = new UserSession();
			userSession.userId = user._id;
			userSession.save((err, doc) => {
				if (err) {
					console.log(err);
					return res.send({
						success: false,
						message: 'Error: server error'
					});
				}
				return res.send({
					success: true,
					message: 'Valid sign in',
					token: doc._id,
	                user: user
				});
			});
		});
		/*return res.status(404).send({
			success: false,
			message: 'Error: User not found'
		});*/
	});

	router.get('/logout', (req, res, next) => {
		// Get the token
		const { query } = req;
		const { token } = query;
		// ?token=test

		// Verify the token is one of a kind and it's not deleted.

		UserSession.findOneAndUpdate({
			_id: token,
			isDeleted: false
		}, {
			$set: {
				isDeleted:true
			}
		}, null, (err, sessions) => {
			if (err) {
				console.log(err);
				return res.send({
					success: false,
					message: 'Error: Server error'
				});
			}

			return res.send({
				success: true,
				message: 'Good'
			});
		});
	});

	router.get('/verify', (req, res, next) => {
		// Get the token
		const { query } = req;
		const { token } = query;
		// ?token=test

		// Verify the token is one of a kind and it's not deleted.

		UserSession.find({
				_id: token,
				isDeleted: false
			}, 
			(err, sessions) => {
				if (err) {
					console.log(err);
					return res.send({
						success: false,
						message: 'Error: Server error'
					});
				}

				if (sessions.length != 1) {
					return res.send({
						success: false,
						message: 'Error: Invalid'
					});
				} else {
					// DO ACTION
					return res.send({
						success: true,
						message: 'Good'
					});
				}
			});
		});
	
	router.get('/loginFailure', (req,res,next) => {
		res.status(400).send({
			success: false,
			message: 'login failed!'
		})
	})

	// returns the router as result of export function wrapper
	return router;
}
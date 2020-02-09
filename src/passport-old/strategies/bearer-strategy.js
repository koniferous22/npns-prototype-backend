const BearerStrategy = require('passport-http-bearer').Strategy;

const init_bearer = (passport) => {
	passport.use(new BearerStrategy(function(token, done) {
		User.findOne({ token: token }, function (err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false);
			}
			return done(null, user, { scope: 'all' });
		});
	}))
}

module.exports = init_bearer
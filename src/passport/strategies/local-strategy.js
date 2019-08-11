const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/user')

const init_local = (passport) => {
	passport.use(new LocalStrategy(function(username, password, done) {
    	User.findOne({ username: username }, function (err, user) {
			if (err) { 
				return done(err);
			}
			if (!user) { 
				return done(null, false);
			}
			if (!user.validPassword(password)) {
				return done(null, false);
			}
      	return done(null, user);
    	});
    }))
}

module.exports = init_local
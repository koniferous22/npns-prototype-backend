const init_local = require('./strategies/local-strategy');
const init_bearer = require('./strategies/bearer-strategy');

init_passport = passport => {
	init_local(passport)
	init_bearer(passport)

    passport.serializeUser(function(user, done) {
        // .id field does not work, _id has to be used
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    return passport;
}

module.exports = init_passport
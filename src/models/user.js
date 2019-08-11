const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
	id: {
		type: String,
	},
	username: {
		type: String,
		default: ''
	},
	password: {
		type: String,
		default: ''
	},
	email: {
		type: String,
		default: ''
	},
	firstName: {
		type: String,
		default: ''
	},
	lastName: {
		type: String,
		default: ''
	}
});

UserSchema.methods.generateHash = function(pwd) {
	return bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(pwd) {
	return bcrypt.compareSync(pwd, this.password);
};

module.exports = mongoose.model('User', UserSchema, 'User');

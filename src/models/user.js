const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const transporter = require('../nodemailer/transporter');

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		index: true
	},
	password: require('./constraints/password'),
	email: {
		required: true,
		unique: true,
        index: true,
        ...require('./constraints/email')
	},
	firstName: {
		type: String,
		default: ''
	},
	lastName: {
		type: String,
		default: ''
	},
	verified: {
		type: Boolean,
		default: false
	},
	balances: {
		type: Map,
		of: {
			type: Number,
			min: 0
		}
	}
	/*
	commented out cuz too much features,
	adult: {
		type: Boolean,
		default: false
	}*/
});

UserSchema.static('generateHash', async function(pwd) {
	password = await bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null);
	return password
});

UserSchema.methods.validPassword = async function(pwd) {
	const result = await bcrypt.compare(pwd, this.password);
	//console.log(result)
	return result
};
UserSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await UserModel.generateHash(user.password)
    }
    if (validator.isEmail(user.username) && user.username != user.email) {
    	throw new Error({message:'Different email injected into username'})
    }
    if (!user.username) {
    	user.username = user.email
    }
    next()
})

UserSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    user.tokens.push({ token })
    await user.save()
    return token
}

UserSchema.methods.sendEmail = async function(template,params) {
	const email = {
        from: 'noreply@npns.biz',
        to: params.email || this.email,
        ...template(params)
    }
    await transporter.sendMail(email)
}

// migrate to pre-update callback
UserSchema.methods.setVerifiedFlag = function() {
	const user = this
	if (!!user.verified) {
		throw new Error({error: 'User already fied'})
	}
	user.verified = true
}

UserSchema.methods.addBalance = function(qid, balanceToAdd) {
	// TODO qid validation
	var balance = this.balances.get(qid) || 0;
	balance += balanceToAdd;
	this.balances.set(qid, balance);
}

UserSchema.query.byLogin = async function (input) {
	const predicate = (validator.isEmail(input)) ? {email:input} : {username:input}
    const user = await this.findOne(predicate)
    return user
}

UserSchema.query.byCredentials = async function (input, password) {
    // Search for a user by email and password.
 	user = await this.find().byLogin(input)

    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const hasValidPassword = await user.validPassword(password);
	if (!hasValidPassword) {
		throw new Error({ error: 'Invalid login credentials' })
	}

	return user
}

UserModel = mongoose.model('User', UserSchema, 'User');

module.exports = UserModel

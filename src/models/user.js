const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const transporter = require('../nodemailer/transporter');
const { signupTemplate } = require('../nodemailer/templates');

// https://codemoto.io/coding/nodejs/email-verification-node-express-mongodb
// https://stackoverflow.com/questions/39092822/how-to-do-confirm-email-address-with-express-node

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		validate: value => {
			if (validator.isEmail(value)) {
				// CHANGE VALIDATOR TO SOMETHING BETTER (Limited set of chars verified by regex)
				throw new Error({error: 'username cannot be in shape of email'})
			}
		},
		index: true
	},
	password: {
		type: String,
		required: true,
		minLength: 8
	},
	email: {
		type: String,
		required: true,
		unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
	},
	firstName: {
		type: String,
		default: ''
	},
	lastName: {
		type: String,
		default: ''
	},
	tokens: [{
		token: {
			type: String,
			required: true
		},
		created: {
			type: Date,
			default: Date.now,
			required: true,
			expires: 86400 // 1 day
		}
	}],
	verified: {
		type: Boolean,
		default: false
	}
});

UserSchema.static('generateHash', async function(pwd) {
	password = await bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null);
	return password
});

UserSchema.methods.validPassword = async function(pwd) {
	const result = await bcrypt.compare(pwd, this.password);
	console.log(result)
	return result
};
UserSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await UserModel.generateHash(user.password)
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

UserSchema.methods.sendSignupEmail = async function(token) {
	const email = {
        from: 'noreply@npns.biz',
        to: this.email,
        ...signupTemplate(token.token)
    }
    transporter.sendMail(email)
}

UserSchema.methods.setVerifiedFlag = function() {
	console.log('here')
	const user = this
	if (!!user.verified) {
		throw new Error({error: 'User already verified'})
	}
	user.verified = true
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


/*
change username,
change password,
change email
*/

UserModel = mongoose.model('User', UserSchema, 'User');

module.exports = UserModel

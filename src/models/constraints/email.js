const validator = require('validator');

const constraints = {
	type: String,
	lowercase: true,
    validate: value => {
        if (!validator.isEmail(value)) {
            throw new Error({error: 'Invalid Email address'})
        }
    }
}

module.exports = constraints
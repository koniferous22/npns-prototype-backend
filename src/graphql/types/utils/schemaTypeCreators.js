const PasswordSchemaTypeCreator = () => ({
	type: String,
	required: true,
	minLength: 8
})

const EmailSchemaTypeCreator = (requiredFlagOrCallback = true, shouldHaveUniqueIndex = true, ) => ({
	type: String,
	required: requiredFlagOrCallback,
	unique: shouldHaveUniqueIndex,
	lowercase: true,
    validate: value => {
        if (!validator.isEmail(value)) {
            throw new Error({error: 'Invalid Email address'})
        }
    }
})

const TimestampSchemaTypeCreator = () => ({
	type: Date,
	default: Date.now,
	index: true,
	max: Date.now
})

module.exports = {
	PasswordSchemaTypeCreator,
	EmailSchemaTypeCreator,
	TimestampSchemaTypeCreator
}
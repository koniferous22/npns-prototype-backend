export const PasswordSchemaTypeCreator = () => ({
	type: String,
	required: true,
	minLength: 8
})

export const EmailSchemaTypeCreator = (requiredFlagOrCallback = true, shouldHaveUniqueIndex = true, ) => ({
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

export const TimestampSchemaTypeCreator = () => ({
	type: Date,
	default: Date.now,
	index: true,
	max: Date.now
})

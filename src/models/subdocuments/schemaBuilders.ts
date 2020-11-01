import validator from 'validator';

export const PasswordSchemaTypeCreator = () => ({
  type: String,
  required: true,
  minLength: 8
});

type RequiredCallback = () => boolean;
type RequiredFlagOrCallback = boolean | RequiredCallback;

export const EmailSchemaTypeCreator = (requiredFlagOrCallback: RequiredFlagOrCallback = true, shouldHaveUniqueIndex = true) => ({
  type: String,
  required: requiredFlagOrCallback,
  unique: shouldHaveUniqueIndex,
  lowercase: true,
  validate: (value: string) => {
    if (!validator.isEmail(value)) {
      throw new Error('Invalid Email address')
    }
    return true;
  }
});

export const TimestampSchemaTypeCreator = () => ({
  type: Date,
  default: Date.now,
  index: true,
  max: Date.now
});

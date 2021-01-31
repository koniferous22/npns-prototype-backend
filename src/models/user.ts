import mongoose  from 'mongoose';
import validator  from 'validator';
import bcrypt  from 'bcrypt';
import jwt  from 'jsonwebtoken';
// TODO is this dependency really necesary?
import { PasswordSchemaTypeCreator, EmailSchemaTypeCreator, TimestampSchemaTypeCreator } from './subdocuments/schemaBuilders';

const AuthTokenDbSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 12000
  }
})

const KarmaEntryDbSchema = new mongoose.Schema({
  queue: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Queue'
  },
  karma: {
    type: Number,
    required: true,
    min: 0
  }
})

const TransactionDbSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  amount: {
    type: Number,
    // refactor with currency enum
    default: 0
  },
  karmaAmount: {
    type: Number,
    default: 0
  },
  createdAt: TimestampSchemaTypeCreator(),
  meta: {
    // TODO define custom validator, that would for each transaction type validate correct transaction meta
    relatedQueue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue'
    }
  }
})

type TransactionMetaType = {
  relatedQueue?: mongoose.Types.ObjectId;
};

export type UserType = mongoose.Document & {
	username: string;
	password: string;
	email: string;
	firstName: string
	lastName: string;
	wallet: number;
	referredBy: string;
	verified: boolean;
	allowNsfw: boolean;
	karmaEntries: Array<mongoose.Types.Subdocument & {
    queue: mongoose.Types.ObjectId;
    karma: number;
  }>;
	transactions: Array<mongoose.Types.Subdocument & {
    type: string;
    from: mongoose.Types.ObjectId | string;
    to: mongoose.Types.ObjectId;
    amount: number;
    karmaAmount: number;
    createdAt?: Date;
    meta: TransactionMetaType;
  }>;

	isPasswordValid(password: string): Promise<boolean>;
	setUserVerified(): UserType;
}

const UserDbSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  password: PasswordSchemaTypeCreator(),
  email: EmailSchemaTypeCreator(),
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  wallet: {
    type: Number,
    default: 0
  },
  referredBy: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  },
  allowNsfw: {
    type: Boolean,
    default: false
  },
  transactions: [TransactionDbSchema],
  karmaEntries: [KarmaEntryDbSchema]
})

UserDbSchema.statics.findByIdentifier = function (identifier: string) {
  const predicate = validator.isEmail(identifier) ? {email:identifier} : {username:identifier}
  return this.findOne(predicate)
}
UserDbSchema.statics.generatePasswordHash = function (pwd: string) {
  return bcrypt.hashSync(pwd, bcrypt.genSaltSync(8))
}
UserDbSchema.statics.areIdentifiersAvailable = function (username: string, email: string) {
  return this.exists({
    $or: [
      {username},
      {email}
    ]
  })
}
// TODO refactor into permission scope
UserDbSchema.methods.isPasswordValid = function (comparedPassword: string) {
  return bcrypt.compare(comparedPassword, this.password)
}

UserDbSchema.methods.setUserVerified = function () {
  if (this.verified) {
    throw new Error('User already verified')
  }
  this.verified = true
  return this
}
type UserModelType = mongoose.Model<UserType> & {
  findByIdentifier(identifier: string): Promise<UserType>;
	signUp(username: string, password: string, email: string, firstName: string, lastName: string): UserType;
	signIn(identifier: string, password: string): Promise<UserType>;
	generatePasswordHash(password: string): string;
	areIdentifiersAvailable(username: string, email: string): Promise<boolean>;
}

export const UserModel = mongoose.model<UserType, UserModelType>('User', UserDbSchema, 'User');

import mongoose from 'mongoose';
import jwt  from 'jsonwebtoken';
import { configuration } from '../../config/index';

// NOTE this file should be deleted. but is kept because of the fucking legacy reasons

export type AuthTokenType = mongoose.Document & {
	user: mongoose.Types.ObjectId;
	token: string;
	createdAt: Date;
}

const AuthTokenDbSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    unique: true,
    index: true,
    default: function() {
      return jwt.sign({_id: this.user}, configuration.jwtKey)
    } 
  },
  createdAt: {
  	type: Date,
  	default: Date.now,
  	expires: 12000
  }
} as mongoose.SchemaDefinition & ThisType<AuthTokenType>)

AuthTokenDbSchema.statics.generate = async function (user: mongoose.Types.ObjectId) {
  const authTokenRecord = new this({ user })
  await authTokenRecord.save()
  return authTokenRecord	
}
AuthTokenDbSchema.statics.findRecord = function (token: string) {
  return this.findOne({ token })
}

type AuthTokenModelType = mongoose.Model<AuthTokenType> & {
	generate: (user: mongoose.Types.ObjectId) => Promise<AuthTokenType>;
	findRecord: (token: string) => Promise<AuthTokenType>;
}

export const AuthTokenModel = mongoose.model<AuthTokenType, AuthTokenModelType>('AuthToken', AuthTokenDbSchema, 'AuthToken');

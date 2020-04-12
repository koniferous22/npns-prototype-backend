import mongoose from 'mongoose';
import jwt  from 'jsonwebtoken';

export interface AuthTokenType extends mongoose.Document {
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
			return jwt.sign({_id: this.user}, process.env.JWT_KEY)
		} 
	},
	createdAt: {
    	type: Date,
    	default: Date.now,
    	expires: 12000
    }
})

AuthTokenDbSchema.statics.generate = async function (user: mongoose.Types.ObjectId) {
	const authTokenRecord = new this({ user })
	await authTokenRecord.save()
	return authTokenRecord	
}
AuthTokenDbSchema.statics.findRecord = function (token: string) {
	return this.findOne({ token })
}
AuthTokenDbSchema.statics.deleteToken = function (token: string) {
	return this.deleteOne({ token })
}
AuthTokenDbSchema.statics.deleteAllBy = function (user: mongoose.Types.ObjectId) {
	return this.deleteMany({ user })
}

interface AuthTokenModelType extends mongoose.Model<AuthTokenType> {
	generate: (user: mongoose.Types.ObjectId) => Promise<AuthTokenType>;
	findRecord: (token: string) => Promise<AuthTokenType>;
	deleteToken: (token: string) => Promise<void>;
	deleteAllBy: (user: string) => Promise<void>;
}

export default mongoose.model('AuthToken', AuthTokenDbSchema, 'AuthToken') as AuthTokenModelType;

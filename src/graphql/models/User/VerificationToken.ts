import mongoose  from 'mongoose';
import jwt  from 'jsonwebtoken';

import {
	UserType
} from './index'

import {
	EmailSchemaTypeCreator
} from '../../utils/subSchemaCreators'

export interface VerificationTokenType extends mongoose.Document {
	type: string;
	user: mongoose.Types.ObjectId;
	token: string;
	createdAt: Date;
	payload: {
		userUpdate: {
			newUsername: string;
			newEmail: string;
		}
	}
	getUser(): Promise<UserType>;
}

const USERNAME_UPDATE = 'USER_UPDATE_USERNAME'
const PASSWORD_RESET = 'USER_PASSWORD_RESET'
const EMAIL_UPDATE = 'USER_UPDATE_EMAIL'


const VerificationTokenDbSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: [USERNAME_UPDATE, PASSWORD_RESET, EMAIL_UPDATE],
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	token: {
    	type: String,
    	required: true,
    	default: function() {
    		return crypto.randomBytes(16).toString('hex')
    	}
    },
	createdAt: {
		type: Date,
		default: Date.now,
		index: true,
		max: Date.now
	},
	payload: {
		userUpdate: {
			newUsername: {
				type: String,
				required: () => (this as VerificationTokenType).type === USERNAME_UPDATE
			},
			newEmail: EmailSchemaTypeCreator(
				function() {
					this.type === EMAIL_UPDATE
				},
				false
			)
		}
	}

})

VerificationTokenDbSchema.statics.findRecord = function (token: string) {
	return this.findOne({ token })
}

VerificationTokenDbSchema.statics.deleteAllBy = function (user: mongoose.Types.ObjectId) {
	return this.deleteMany({ user })
}

VerificationTokenDbSchema.methods.getUser = async function () {
	return (await this.populate('user').execPopulate()).user
}

interface VerificationTokenModelType extends mongoose.Model<VerificationTokenType> {
	findRecord: (token: string) => Promise<VerificationTokenType>;
	deleteAllBy: (user: mongoose.Types.ObjectId) => Promise<void>;
}

export default mongoose.model('VerificationToken', VerificationTokenDbSchema, 'VerificationToken') as VerificationTokenModelType

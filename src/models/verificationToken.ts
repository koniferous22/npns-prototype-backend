import crypto from 'crypto';
import mongoose  from 'mongoose';
import jwt  from 'jsonwebtoken';

import { UserType } from './user';

import { EmailSchemaTypeCreator}  from './subdocuments/schemaBuilders';

export type VerificationTokenType = mongoose.Document & {
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
}

export const USERNAME_UPDATE = 'USER_UPDATE_USERNAME' as const;
export const PASSWORD_RESET = 'USER_PASSWORD_RESET' as const;
export const EMAIL_UPDATE = 'USER_UPDATE_EMAIL' as const;
export const SIGN_UP = 'USER_SIGN_UP' as const;

const VerificationTokenDbSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [USERNAME_UPDATE, PASSWORD_RESET, EMAIL_UPDATE, SIGN_UP],
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
        required: function () {
          // @ts-ignore
          return this.type === USERNAME_UPDATE
        }
      },
      newEmail: EmailSchemaTypeCreator(
        // @ts-expect-error
        function() {
          // @ts-expect-error
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

type VerificationTokenModelType = mongoose.Model<VerificationTokenType> & {
	findRecord: (token: string) => Promise<VerificationTokenType>;
	deleteAllBy: (user: mongoose.Types.ObjectId) => Promise<void>;
}

export const VerificationTokenModel = mongoose.model<VerificationTokenType, VerificationTokenModelType>(
  'VerificationToken',
  VerificationTokenDbSchema,
  'VerificationToken'
);

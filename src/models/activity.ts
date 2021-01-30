import mongoose from 'mongoose'

import { TimestampSchemaTypeCreator } from './subdocuments/schemaBuilders';

// TODO future feature for now unused

const POST_CHALLENGE = 'POST_CHALLENGE' as const;
const POST_SUBMISSION = 'POST_SUBMISSION' as const;
const POST_REPLY = 'POST_REPLY' as const;
const EDIT_CHALLENGE = 'EDIT_CHALLENGE' as const;
const EDIT_SUBMISSION = 'EDIT_SUBMISSION' as const;
const EDIT_REPLY = 'EDIT_REPLY' as const;

type ActivityMetaIdentifiersType = {
	challenge?: mongoose.Types.ObjectId;
	submission?: mongoose.Types.ObjectId;
	reply?: mongoose.Types.ObjectId;
	edit?: mongoose.Types.ObjectId;
}

type ActivityMetaType = {
	identifiers?: ActivityMetaIdentifiersType
}

export type ActivityType = mongoose.Types.Subdocument & {
	createdAt: Date;
} & (
  | {
    type: 'POST_CHALLENGE';
    identifiers: {
      challenge: mongoose.Types.ObjectId;
    }
  }
  | {
    type: 'POST_SUBMISSION';
    identifiers: {
      challenge: mongoose.Types.ObjectId;
      submission: mongoose.Types.ObjectId;
    }
  }
  | {
    type: 'POST_REPLY';
    identifiers: {
      challenge: mongoose.Types.ObjectId;
      submission: mongoose.Types.ObjectId;
      reply: mongoose.Types.ObjectId;
    }
  }
  | {
    type: 'EDIT_CHALLENGE';
    identifiers: {
      challenge: mongoose.Types.ObjectId;
      edit: mongoose.Types.ObjectId;
    }
  }
  | {
    type: 'EDIT_SUBMISSION';
    identifiers: {
      challenge: mongoose.Types.ObjectId;
      submission: mongoose.Types.ObjectId;
      edit: mongoose.Types.ObjectId;
    }
  }
  | {
    type: 'EDIT_REPLY';
    identifiers: {
      challenge: mongoose.Types.ObjectId;
      submission: mongoose.Types.ObjectId;
      reply: mongoose.Types.ObjectId;
      edit: mongoose.Types.ObjectId;
    }
  }
)

export const ActivityDbSchema = new mongoose.Schema<ActivityType>({
  type: {
    type: String,
    required: true,
    enum: [
      POST_CHALLENGE,
      POST_REPLY,
      POST_SUBMISSION,
      EDIT_CHALLENGE,
      EDIT_SUBMISSION,
      EDIT_REPLY
    ]
  },
  createdAt: TimestampSchemaTypeCreator(),
  meta: {
    identifiers: {
      challenge: {
        // @ts-ignore
        required: function() {
          return [
            POST_CHALLENGE,
            POST_SUBMISSION,
            POST_REPLY,
            EDIT_CHALLENGE
          // @ts-ignore
          ].includes(this.type)
        }
      },
      submission: {
        // @ts-ignore
        required: function() {
          return [
            POST_SUBMISSION,
            POST_REPLY,
            EDIT_SUBMISSION
          // @ts-ignore
          ].includes(this.type)
        }
      },
      reply: {
        // @ts-ignore
        required: function() {
          return [
            POST_REPLY,
            EDIT_REPLY
          // @ts-ignore
          ].includes(this.type)
        }
      },
      edit: {
        // @ts-ignore
        required: function() {
          return [
            EDIT_CHALLENGE,
            EDIT_SUBMISSION,
            EDIT_REPLY
          // @ts-ignore
          ].includes(this.type)
        }
      }
    }
  }
})

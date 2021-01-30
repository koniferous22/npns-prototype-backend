import mongoose  from 'mongoose'
import { TimestampSchemaTypeCreator } from './subdocuments/schemaBuilders';

type ContentMetaType = mongoose.Types.Subdocument & {
  submittedBy: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  isActive: boolean;
  attachmentUrls?: string[];
}

const ContentMetaDbSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // TODO replace this by ref to key-value content storage
  content: {
    type: String,
    required: true
  },
  createdAt: TimestampSchemaTypeCreator(),
  isActive: {
    type: Boolean,
    default: true
  },
  attachmentUrls: [{
    type: String
  }]
})


type EditType = mongoose.Types.Subdocument & {
  contentMeta: ContentMetaType;
}

const EditDbSchema = new mongoose.Schema({
  contentMeta: ContentMetaDbSchema,
})

const ReplyDbSchema = new mongoose.Schema({
  contentMeta: ContentMetaDbSchema,
  edits: [EditDbSchema]
})

const SubmissionDbSchema = new mongoose.Schema({
  contentMeta: ContentMetaDbSchema,
  edits: [EditDbSchema],
  replies: [ReplyDbSchema]
})

export type ChallengeType = mongoose.Document & {
  // TODO fix
	contentMeta: any;
	queue: mongoose.Types.ObjectId;
	rootQueueValue: number;
	acceptedSubmission: mongoose.Types.ObjectId;
	title: string;
	viewCount: number;
	boosts: Array<mongoose.Types.Subdocument & {
    boostAmount: number;
    boostedBy: mongoose.Types.ObjectId;
  }>;
	edits: EditType[];
	submissions: Array<mongoose.Types.Subdocument & {
    contentMeta: ContentMetaType;
    edits: EditType[];
    replies: Array<mongoose.Types.Subdocument & {
      contentMeta: ContentMetaType;
      edits: EditType[];
    }>;
  }>;
	totalBoostAmount: number;
	bounty: number;
	isSolved:boolean;
}

const BoostDbSchema = new mongoose.Schema({
  boostAmount: {
    type: Number,
    required: true
  },
  boostedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // TODO improve
  paypal_order: {
    type: Object
  }
})

const ChallengeDbSchema = new mongoose.Schema({
  contentMeta: ContentMetaDbSchema,
  queue: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Queue'
  },
  rootQueueValue: {
    type: Number,
    default: 0,
    index: true
  },
  acceptedSubmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  },
  title: {
    type: String,
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  // TODO inject subschemas directly
  boosts: [BoostDbSchema],
  edits: [EditDbSchema],
  submissions: [SubmissionDbSchema],

  // DERIVED FIELDS
  totalBoostAmount: {
    type: Number,
    default: 0
  },
  bounty: {
    type: Number,
    default: 0
  },
  isSolved: {
    type: Boolean,
    default: false
  }

})

ChallengeDbSchema.index({
  bounty: -1,
  _id: 1
});

type ChallengeModelType = mongoose.Model<ChallengeType>;

export const ChallengeModel = mongoose.model<ChallengeType, ChallengeModelType>('Challenge', ChallengeDbSchema, 'Challenge');

import mongoose  from 'mongoose'

import { ContentMetaDbSchema, ContentMetaSchema, ContentMetaResolvers, ContentMetaType } from './ContentMeta'
import { EditDbSchema, EditSchema, EditType } from './Edit'
import { ReplySchema } from './Reply'
import { SubmissionDbSchema, SubmissionSchema, SubmissionType } from './Submission'

import { PagingSizeType } from '../../utils/types'

import { calculatePageCount } from '../../../utils'

interface BoostType extends mongoose.Types.Subdocument {
	boostAmount: number;
	boostedBy: mongoose.Types.ObjectId;
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

export interface ChallengeType extends mongoose.Document {
	contentMeta: any;
	queue: mongoose.Types.ObjectId;
	rootQueueValue: number;
	acceptedSubmission: mongoose.Types.ObjectId;
	title: string;
	viewCount: number;
	boosts: BoostType[];
	edits: EditType[];
	submissions: SubmissionType[];
	totalBoostAmount: number;
	bounty: number;
	isSolved:boolean;

	markSolved(acceptedSubmission: mongoose.Types.ObjectId): ChallengeType;
	boostChallenge(boostedBy: mongoose.Types.ObjectId,  boostedAmount: number): ChallengeType
	getSubmission(submissionId: mongoose.Types.ObjectId): SubmissionType;
	postSubmission(submittedBy: mongoose.Types.ObjectId, content: string): SubmissionType;
	getEdit(editId: mongoose.Types.ObjectId): EditType;
	postEdit(submittedBy: mongoose.Types.ObjectId, content: string): EditType;
}

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

ChallengeDbSchema.statics.findChallengeById = function (id: mongoose.Types.ObjectId) {
	return this.findOne({ id })
}

ChallengeDbSchema.statics.postChallenge = function (
	queue: mongoose.Types.ObjectId,
	submittedBy: mongoose.Types.ObjectId,
	title: string,
	content: string
) {
	return new this({
		contentMeta: {
			submittedBy: submittedBy,
			content: content
		},
		queue: queue,
		title: title
	})
}

ChallengeDbSchema.statics.viewChallenge = async function (id: mongoose.Types.ObjectId) {
	const challenge = await this.findOne({ _id: id })
	// TODO read about fetching subdocuments in mongoose
	challenge.view_count++
	// low priority operation
	await challenge.save()
	return challenge
}

ChallengeDbSchema.methods.boostChallenge = function (boostedBy: mongoose.Types.ObjectId, boostedAmount: number) {
	if (boostedAmount <= 0) {
		throw new Error('Cannot boost with negative amount')
	}
	this.boosts.push({
		boostedBy,
		boostedAmount
	})
	return this
}

ChallengeDbSchema.methods.markSolved = function (acceptedSubmission: mongoose.Types.ObjectId) {
	const submission = this.getSubmission(acceptedSubmission)
	if (!submission) {
		throw new Error('No such submission found')	
	}
	this.acceptedSubmission = submission
	this.isSolved = true
	return this
}

ChallengeDbSchema.methods.getSubmission = function (submissionId: mongoose.Types.ObjectId) {
	return this.submissions.id(submissionId)
}

ChallengeDbSchema.methods.postSubmission = function (submittedBy: mongoose.Types.ObjectId, content: string) {
	const newSubmission = this.submissions.create({
		contentMeta: {
			submittedBy,
			content	
		}
	})
	this.submissions.push(newSubmission);
	return newSubmission
}

ChallengeDbSchema.methods.getEdit = function (editId: mongoose.Types.ObjectId) {
	return this.edits.id(editId)
}

ChallengeDbSchema.methods.postEdit = function (submittedBy: mongoose.Types.ObjectId, content: string) {
	const newEdit = this.edits.create({
		contentMeta: {
			submittedBy,
			content	
		}
	})
	this.edits.push(newEdit);
	return newEdit
}

interface ChallengeModelType extends mongoose.Model<ChallengeType> {
	findChallengeById(id: mongoose.Types.ObjectId): Promise<ChallengeType>;
	postChallenge(
		queue: mongoose.Types.ObjectId,
		submittedBy: mongoose.Types.ObjectId,
		title: string,
		content: string
	): ChallengeType;
	viewChallenge(id: mongoose.Types.ObjectId): Promise<ChallengeType>;
	markSolved(acceptedSubmission: mongoose.Types.ObjectId): Promise<ChallengeType>;
	getSubmission(submissionId: mongoose.Types.ObjectId): SubmissionType;
	postSubmission(submittedBy: mongoose.Types.ObjectId, content: string): SubmissionType;
	getEdit(editId: mongoose.Types.ObjectId): EditType;
	postEdit(submittedBy: mongoose.Types.ObjectId, content: string): EditType;
}

const Challenge = mongoose.model<ChallengeType>('Challenge', ChallengeDbSchema, 'Challenge') as ChallengeModelType

export const ChallengeSchema =`
	${ContentMetaSchema}
	${EditSchema}
	${ReplySchema}
	${SubmissionSchema}

	type Boost {
		boostAmount: Float!
		boostedBy: User
		# payPalOrder: ???
	}

	type Challenge {
		contentMeta: ContentMeta!
		queue: Queue!
		rootQueueValue: Float!
		acceptedSubmission: Submission
		title: String!
		viewCount: Int!
		boosts: [Boost!]!
		edits: [Edit!]!
		submissionPageCount(pageCount: Int): Int!
		submissions: [Submission!]!

		totalBoostAmount: Int!
		bounty: Int!
		isSolved: Boolean!
	}
`

export const ChallengeResolvers = {
	queue: async (challenge: ChallengeType) => (await challenge.populate('queue').execPopulate()).queue,
	submissionPageCount: (challenge: ChallengeType, { pageSize = 50 }: PagingSizeType) => calculatePageCount(challenge.submissions.length, pageSize),
}

export const ChallengeNestedResolvers = {
	ContentMeta: ContentMetaResolvers
}

export default Challenge
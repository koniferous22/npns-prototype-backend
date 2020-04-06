import mongoose  from 'mongoose'

import { ContentMetaDbSchema, ContentMetaSchema, ContentMetaResolvers } from './ContentMeta'
import { EditDbSchema, EditSchema } from './Edit'
import { ReplySchema } from './Reply'
import { SubmissionDbSchema, SubmissionSchema } from './Submission'

import { calculatePageCount } from '../../../utils'

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
	},
	_id: false
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

ChallengeDbSchema.statics.postChallenge = function (queue, submittedBy, title, content) {
	return new Challenge({
		contentMeta: {
			submittedBy: submittedBy,
			content: content
		},
		queue: queue,
		title: title
	})
}

ChallengeDbSchema.statics.viewChallenge = async function (id) {
	const challenge = await this.findOne({ _id: id })
	// TODO read about fetching subdocuments in mongoose
	challenge.view_count++
	await challenge.save()
	return challenge
}

export const Challenge = mongoose.model('Challenge', ChallengeDbSchema, 'Challenge')

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
	queue: async challenge => (await challenge.populate('queue').execPopulate()).queue,
	submissionPageCount: (challenge, {pageSize = 50}) => calculatePageCount(chalenge.submissions.length, pageSize),
}

export const ChallengeNestedResolvers = {
	ContentMeta: ContentMetaResolvers
}

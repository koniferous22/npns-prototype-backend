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

ChallengeDbSchema.statics.findById = function (id) {
	return this.findOne({ id })
}

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
	// low priority operation
	await challenge.save()
	return challenge
}

ChallengeDbSchema.methods.markSolved = function (acceptedSubmission) {
	const submission = this.getSubmission(acceptedSubmission)
	if (!submission) {
		throw new Error('No such submission found')	
	}
	this.acceptedSubmission = submission
	this.isSolved = true
	return this
}

ChallengeDbSchema.methods.getSubmission = function (submissionId) {
	return this.submissions.id(submissionId)
}

ChallengeDbSchema.methods.postSubmission = function (submittedBy, content) {
	const newSubmission = this.submissions.create({
		contentMeta: {
			submittedBy,
			content	
		}
	})
	this.submissions.push(newSubmission);
	return newSubmission
}

ChallengeDbSchema.methods.getEdit = function (editId) {
	return this.edits.id(editId)
}

ChallengeDbSchema.methods.postEdit = function (submittedBy, content) {
	const newEdit = this.edits.create({
		contentMeta: {
			submittedBy,
			content	
		}
	})
	this.edits.push(newEdit);
	return newEdit
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

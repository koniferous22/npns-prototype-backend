import { Types } from 'mongoose'

import User from '../models/User'
import Challenge from '../models/Challenge'

import { authentication } from '../../utils/authentication'

type MarkChallengeSolvedInputType = {
	token: string;
	challenge: Types.ObjectId;
	acceptedSubmission: Types.ObjectId;
}

export const markChallengeSolvedInput = `
	input MarkChallengeSolvedInput {
		token: String!
		challenge: ID!
		acceptedSubmission: ID!
	}
`
export const markChallengeSolvedPayload = `
	type MarkChallengeSolvedPayload {
		challenge: Challenge
	}
`

const KARMA_VALUE = 1

export const markChallengeSolved = async(_: void, { markChallengeSolvedInput }: { markChallengeSolvedInput: MarkChallengeSolvedInputType }) => {
	const user = await authentication(markChallengeSolvedInput.token)
	const challenge = await Challenge.findById(markChallengeSolvedInput.challenge)
	if (user._id !== challenge.contentMeta.submittedBy._id) {
		throw new Error('Fuck off not your challenge biaach')
	}
	challenge.markSolved(markChallengeSolvedInput.acceptedSubmission)
	const winnerId = challenge.getSubmission(markChallengeSolvedInput.acceptedSubmission).contentMeta.submittedBy
	const winner = await User.findOne({id: winnerId})
	winner.addTransaction('KOKOT', 'NPNS_team.biz', null, challenge.bounty || 0, KARMA_VALUE, { relatedQueue: challenge.queue })
	winner.addBalance(challenge.queue, challenge.bounty, KARMA_VALUE)
	await Promise.all([challenge.save(), winner.save()])
	return {
		challenge
	}
}

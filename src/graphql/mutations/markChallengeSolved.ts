import { Challenge } from '../types/Challenge'
import { Submission } from '../types/Challenge/Submission'

import { authentication } from '../../utils/authentication'

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

export const markChallengeSolved = async(_, { markChallengeSolvedInput }) => {
	const user = await authentication(markChallengeSolved.token)
	const challenge = await challenge.findById(markChallengeSolvedInput.challenge)
	if (user._id !== challenge.contentMeta.submittedBy._id) {
		throw new Error('Fuck off not your challenge biaach')
	}
	challenge.markSolved(markChallengeSolvedInput.acceptSubmission)
	const winner = challenge.getSubmission(markChallengeSolvedInput.acceptSubmission).contentMeta.submittedBy
	winner.addTransaction('KOKOT', { from: 'NPNS_team.biz'}, challenge.bounty || 0, KARMA_VALUE, { relatedQueue: challenge.queue })
	winner.addBalance(challenge.queue, challenge.bounty, KARMA_VALUE)
	await Promise.all([challenge.save(), winner.save()])
	return {
		challenge
	}
}

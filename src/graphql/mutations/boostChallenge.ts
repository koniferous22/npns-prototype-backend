import { Types } from 'mongoose'

import Challenge from '../models/Challenge'
import { authentication } from '../../utils/authentication'

type BoostChallengeInputType = {
	token: string;
	challengeId: Types.ObjectId;
	boostedValue: number;
}

export const boostChallengeInput = `
	input BoostChallengeInput {
		token: String!
		challengeId: ID!
		boostedValue: Int!
	}
`

export const boostChallengePayload = `
	type BoostChallengePayload {
		boostedChallenge: Challenge
	}
`
// TODO rewrite with async await
export const boostChallenge = async (_: void, { boostChallengeInput }: { boostChallengeInput: BoostChallengeInputType }) => {
	const user = await authentication(boostChallengeInput.token)
	const challenge = await Challenge.findChallengeById(boostChallengeInput.challengeId)
	if (challenge.acceptedSubmission) {
		throw new Error('Cannot boost solved challenge')
	}
	if (boostChallengeInput.boostedValue <= 0) {
		throw new Error('Boost value has to be positive')
	}
	await challenge.boostChallenge(user._id, boostChallengeInput.boostedValue).save()
}

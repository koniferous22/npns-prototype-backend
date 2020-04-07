import { Challenge } from '../types/Challenge'
import { authentication } from '../../utils/authentication'

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
export const boostChallenge = (_, { boostChallengeInput }) => Promise.all([
		authentication(boostChallengeInput.token),
		Challenge.findOne({_id: boostChallengeInput.challengeId})
	]).then(([user, challenge]) => {
		if (challenge.accepted_submission != null) {
			throw new Error({message:'Cannot boost solved challenge'})
		}
		if (boostChallengeInput.boostedValue <= 0) {
			throw new Error({message:'Boost value has to be positive'})
		}
		challenge.boost(user._id, boostChallengeInput.boostedValue)
		return challenge.save()
	})

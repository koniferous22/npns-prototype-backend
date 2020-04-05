const { Challenge } = require('../types/Challenge')
const { authentication } = require('../../utils/authentication')

const boostChallengeInput = `
	input BoostChallengeInput {
		token: String!
		challengeId: ID!
		boostedValue: Int!
	}
`

const boostChallengePayload = `
	type BoostChallengePayload {
		boostedChallenge: Challenge
	}
`
// TODO rewrite with async await
const boostChallenge = (_, { boostChallengeInput }) => Promise.all([
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

module.exports = {
	boostChallengeInput,
	boostChallengePayload,
	boostChallenge
}

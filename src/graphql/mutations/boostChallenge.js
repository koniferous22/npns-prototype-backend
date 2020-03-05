const Challenge = require('../../models/content/problem')
const { Authentication } = require('../../middleware')
 
const { CHALLENGE_FIELDS } = require('../utils/queryFields')

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

const boostChallenge = (_, {boostChallengeInput}) => Promise.all([
		Authentication(boostChallengeInput.token),
		Challenge.findOne({_id: boostChallengeInput.challengeId}, CHALLENGE_FIELDS)
	]).then(([user, challenge]) => {
		if (problem.accepted_submission != null) {
			throw new Error({message:'Cannot boost solved problem'})
		}
		if (req.body.value <= 0) {
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
const { ChallengeSchema, ChallengeResolvers, ChallengeNestedResolvers } = require('./Challenge')
const { QueueSchema, QueueResolvers } = require('./Queue')
const { UserSchema, UserResolvers, UserNestedResolvers } = require('./User')

const types = `
	${ChallengeSchema}
	${QueueSchema}
	${UserSchema}
`
const accessors = {
	...ChallengeNestedResolvers,
	Challenge: ChallengeResolvers,
	Queue: QueueResolvers,
	...UserNestedResolvers,
	User: UserResolvers
}

module.exports = {
	accessors,
	types
}

import { ChallengeSchema, ChallengeResolvers, ChallengeNestedResolvers } from './Challenge'
import { QueueSchema, QueueResolvers } from './Queue'
import { UserSchema, UserResolvers, UserNestedResolvers } from './User'

export const types = `
	${ChallengeSchema}
	${QueueSchema}
	${UserSchema}
`
export const accessors = {
	...ChallengeNestedResolvers,
	Challenge: ChallengeResolvers,
	Queue: QueueResolvers,
	...UserNestedResolvers,
	User: UserResolvers
}

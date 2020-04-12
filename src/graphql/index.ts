import { gql } from 'apollo-server-express'

import { querySchema, Query } from './queries'
import { mutationSchema, Mutation } from './mutations'
import { accessors, types } from './models'
import scalars  from './scalars'

export const typeDefs = gql`
	${scalars}
	${types}
	${querySchema}
	${mutationSchema}
`

export const resolvers = {
	...accessors,
	Query,
	Mutation
}

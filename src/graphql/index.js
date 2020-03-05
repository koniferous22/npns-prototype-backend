const { gql } = require('apollo-server-express')

const { querySchema, Query } = require('./queries')
const { mutationSchema, Mutation } = require('./mutations')
const { accessors, types } = require('./types')
const scalars = require('./scalars')

const typeDefs = gql`
	${scalars}
	${types}
	${querySchema}
	${mutationSchema}
`

const resolvers = {
	...accessors,
	Query,
	Mutation
}

module.exports = {
	typeDefs,
	resolvers
}

const { gql } = require('apollo-server-express')
const { GraphQLDate, GraphQLDateTime } = require('graphql-iso-date')

const mutationInputs = require('./inputs')
const mutationPayloads = require('./payloads')
const scalars = require('./scalars')
const types = require('./types')

const schema = gql`
	${scalars}
	${mutationInputs}
	${mutationPayloads}
	${types}
`

module.exports = schema
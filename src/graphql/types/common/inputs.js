const tokenInput = `
	input TokenInput {
		token: String!
	}
`

const paging = `
	input Paging {
		page: Int!
		pageSize: Int!
	}
`

module.exports = {
	tokenInput,
	paging
}

const { tokenInput, paging } = require('./inputs')
const { messagePayload } = require('./payloads')

module.exports = `
	${tokenInput}
	${paging}
	${messagePayload}
`
const { tokenInput } = require('./inputs')
const { messagePayload } = require('./payloads')

module.exports = `
	${tokenInput}
	${messagePayload}
`
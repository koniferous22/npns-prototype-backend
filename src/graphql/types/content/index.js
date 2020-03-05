const { contentSchema, Content } = require('./Content')
const { challengeSchema, Challenge } = require('./Challenge')
const { editSchema } = require('./Edit')
const { replySchema, Reply } = require('./Reply')
const { submissionSchema, Submission } = require('./Submission')

const contentSchemas = `
	${contentSchema}	
	${editSchema}
	${challengeSchema}
	${replySchema}
	${submissionSchema}
`
const contentAccessors = {
	Content,
	Challenge,
	Reply,
	Submission
}

module.exports = {
	contentSchemas,
	contentAccessors
}

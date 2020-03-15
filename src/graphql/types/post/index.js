const { postSchema, Post } = require('./Post')
const { challengeSchema, Challenge } = require('./Challenge')
const { editSchema } = require('./Edit')
const { replySchema, Reply } = require('./Reply')
const { submissionSchema, Submission } = require('./Submission')

const postSchemas = `
	${postSchema}	
	${editSchema}
	${challengeSchema}
	${replySchema}
	${submissionSchema}
`
const postAccessors = {
	Post,
	Challenge,
	Reply,
	Submission
}

module.exports = {
	postSchemas,
	postAccessors
}

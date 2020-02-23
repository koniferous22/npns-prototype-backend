const ChallengeSchema = require('./Challenge')
const EditSchema = require('./Edit')
const ReplySchema = require('./Reply')
const SubmissionSchema = require('./Submission')

const ContentSchemas = `
	interface Content {
		id: ID!
		submittedBy: User!
		created: Date!
		active: Boolean!
		content: String!
		#edits: [ContentEdit!]!
		attachmentUrls: [String!]!
	}
	
	${EditSchema}
	${ChallengeSchema}
	${ReplySchema}
	${SubmissionSchema}
`
module.exports = ContentSchemas

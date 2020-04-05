const Submission = require('../types/Challenge/Submission')
const Reply = require('../types/Challenge/Reply')

const { authentication } = require('../../utils/authentication')

const postReplyInput = `
	input PostReplyInput {
		token: String!
		relatedSubmission: ID!
		content: String!
	}
`
const postReplyPayload = `
	type PostReplyPayload {
		reply: Reply!
	}
`

const postReply = (_, {postReplyInput}) => Promise.all([
		authentication(postReplyInput.token),
		Submission.findOne({_id: postReplyInput.relatedSubmission})
	]).then(([user, submission]) => {
		const reply = new Reply({
			content: postReplyInput.content,
			submitted_by: user._id,
			submission: submission._id
		})
		return Promise.all([
			reply.save(),
			Submission.updateOne(
	        	{ _id: challenge._id},
	        	{
	        		$push: {
	        			replies: {reply: reply._id}
	        		}
	        	}
        	)
		]).then(() => ({reply}));
	})

module.exports = {
	postReplyInput,
	postReplyPayload,
	postReply
}

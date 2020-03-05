const SubmissionAPI = require('../../models/content/submission')
const ReplyAPI = require('../../models/content/reply')

const { Authentication } = require('../../middleware')

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
		Authentication(postReplyInput.token),
		SubmissionAPI.findOne({_id: postReplyInput.relatedSubmission})
	]).then(([user, submission]) => {
		const reply = new ReplyAPI({
			content: postReplyInput.content,
			submitted_by: user._id,
			submission: submission._id
		})
		return Promise.all([
			reply.save(),
			SubmissionAPI.updateOne(
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

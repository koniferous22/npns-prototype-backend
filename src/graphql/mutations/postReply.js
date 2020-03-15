const SubmissionAPI = require('../../models/post/submission')
const ReplyAPI = require('../../models/post/reply')

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

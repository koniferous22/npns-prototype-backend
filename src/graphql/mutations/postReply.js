import Submission  from '../types/Challenge/Submission'
import Reply  from '../types/Challenge/Reply'

import { authentication } from '../../utils/authentication'

export const postReplyInput = `
	input PostReplyInput {
		token: String!
		relatedSubmission: ID!
		content: String!
	}
`
export const postReplyPayload = `
	type PostReplyPayload {
		reply: Reply!
	}
`

export const postReply = (_, {postReplyInput}) => Promise.all([
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

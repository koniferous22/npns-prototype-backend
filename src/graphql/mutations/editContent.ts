import Content  from '../../models/post/post'
import { authentication } from '../../utils/authentication'

export const editContentInput = `
	input EditContentInput {
		contentId: ID!
		token: String!
		editedContent: String!
	}
`

export const editContentPayload = `
	type EditContentPayload {
		Content: Challenge!
	}
`

export const editContent = async (_, { editContentInput }) => {
	const { contentId, token, editedContent } = editContentInput
	if (!editedContent) {
		throw new Error('Edit cannot be empty')
	}
	return Promise.all([authentication(contentId), Content.findOne({_id: contentId})])
		.then(([user, content]) => {
			if (!user_id.equals(content_owner)) {
				throw new Error('You are not the content owner')
			}
			return Content.updateOne(
				{_id:req.params.id},
				{
					$push: {
						edits: [{contents: req.body.edit}]
					}
				}
			)
		})
}

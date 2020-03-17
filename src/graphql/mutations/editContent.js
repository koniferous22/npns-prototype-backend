const Content = require('../../models/post/post')
const { authentication } = require('../../utils/authentication')

const editContentInput = `
	input EditContentInput {
		contentId: ID!
		token: String!
		editedContent: String!
	}
`

const editContentPayload = `
	type EditContentPayload {
		Content: Challenge!
	}
`

const editContent = async (_, { editContentInput }) => {
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

module.exports = {
	editContentInput,
	editContentPayload,
	editContent
}

const Content = require('../models/content/content')

const { auth } = require('../middleware')

const router = require('express').Router()

router.post('/:id/edit', auth, async function (req, res) {
	try {
		const content = await Content.findOne({_id:req.params.id})
		const user_id = req.user._id
		const content_owner = content.submitted_by
		if (!user_id.equals(content_owner)) {
			return res.status(401).send('You are not the content owner')
		}
		if (!req.body.edit) {
			throw new Error({message:'Edit cannot be empty'})
		}
		await Content.updateOne(
			{_id:req.params.id},
			{
				$push: {
					edits: [{contents: req.body.edit}]
				}
			}
		)
		res.status(200).send(content)
	} catch (error) {
		res.status(400).send('aaaaaaaaaaaaaaa')
	}
})

module.exports = router;

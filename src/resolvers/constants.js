const CHALLENGE_FIELDS = 'id title bounty view_count created submitted_by submission_count active content submissions'
const QUEUE_FIELDS = 'id name parentId karmaValue lft rgt depth'
const SUBMISSION_FIELDS = 'id created submitted_by active content replies problem'
const REPLY_FIELDS = 'id created submitted_by active content submission'
const USER_FIELDS = 'username email firstName lastName referred_by balanceEntries allowNsfw'

module.exports = {
	CHALLENGE_FIELDS,
	QUEUE_FIELDS,
	REPLY_FIELDS,
	SUBMISSION_FIELDS,
	USER_FIELDS
}

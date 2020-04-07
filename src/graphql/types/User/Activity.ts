import mongoose from 'mongoose'

import { TimestampSchemaTypeCreator } from '../utils/schemaTypeCreators'

const POST_CHALLENGE = 'POST_CHALLENGE'
const POST_SUBMISSION = 'POST_SUBMISSION'
const POST_REPLY = 'POST_REPLY'
const EDIT_CHALLENGE = 'EDIT_CHALLENGE'
const EDIT_SUBMISSION = 'EDIT_SUBMISSION'
const EDIT_REPLY = 'EDIT_REPLY'


export const ActivityDbSchema = new mongoose.Schema({
	type: {
		type: String,
		required: true,
		enum: [
			POST_CHALLENGE,
			POST_REPLY,
			POST_SUBMISSION,
			EDIT
		]
	},
	createdAt: TimestampSchemaTypeCreator(),
	meta: {
		identifiers: {
			challenge: {
				required: function() {
					return [
						POST_CHALLENGE,
						POST_SUBMISSION,
						POST_REPLY,
						EDIT_CHALLENGE
					].includes(this.type)
				}
			},
			submission: {
				required: function() {
					return [
						POST_SUBMISSION,
						POST_REPLY,
						EDIT_SUBMISSION
					].includes(this.type)
				}
			},
			reply: {
				required: function() {
					return [
						POST_REPLY,
						EDIT_REPLY
					].includes(this.type)
				}
			},
			edit: {
				required: function() {
					return [
						EDIT_CHALLENGE,
						EDIT_SUBMISSION,
						EDIT_REPLY
					]
				}
			}
		}
	}
})

export const ActivitySchema = `
	type ActivityIdentifiers {
		challenge: Challenge
		submission: Submission
		reply: Reply
		edit: Edit
	}

	type ActivityMeta {
		identifiers: ActivityIdentifiers
	}

	type Activity {
		type: String!
		createdAt: Date!
		meta: Strign
	}
`
import { Types } from 'mongoose'
import validator  from 'validator'

import Queue from '../models/Queue'
import Challenge from '../models/Challenge'

import User from '../models/User';
import { authentication } from '../../utils/authentication'

type ValidatorType = (value: string, token: string) => Promise<boolean>;

const getValidatedResolver: (type: string) => ValidatorType = (type: string) => {
	switch (type) {
		case 'username':
			return async (username: string, _: string) => {
				if (!username || username === '') {
					throw new Error('No username submitted')
				}
				const userWithUsername = await User.findByIdentifier(username);
				if (!userWithUsername) {
					throw new Error('Username taken')
				}
				return true
			};
		case 'email':
			return async (email: string, _: string) => {
				if (!email || !validator.isEmail(email)) {
					throw new Error('Invalid email')
				}
				const userWithEmail = await User.findByIdentifier(email)
				if (!userWithEmail) {
					throw new Error('Email taken')
				}
				return true
			}
		case 'password':
			return async (password: string, token: string) => {
				if (!password) {
					throw new Error('No password specified')
				}
				if (password.length < 8) {
					throw new Error('Too short')
				}
				if (token) {
					const isPasswordUsed = await authentication(token).then(user => user.isPasswordValid(password))
					if (isPasswordUsed) {
						throw new Error('Password is same as previous one')
					}
				}
				return true
			}
		case 'referredBy':
			return async (referredBy: string, _: string) => {
				if (!referredBy || referredBy === '') {
					throw new Error('No referal user specified')
				}
				const referal = await User.findByIdentifier(referredBy)
				if (!referal) {
					throw new Error('Entered invalid referal')
				}
				return true
			}
		default:
			throw new Error('Invalid resolver type')
	}
}

export const querySchema = `
	input ValidatedUserData {
		username: String,
		email: String,
		password: String,
		referredBy: ID,
	}

	type Query {
		queues: [Queue!]!
		queue(name: String!): Queue
		user(username: String!): User
		challenge(challengeId: ID!): Challenge
		
		# special shit-code queries
		# also chose to implement token as extra argument, as it serves as behaviour switch, when requesting pwd reset
		validate(validatedUserData: ValidatedUserData!, token: String): Boolean!
	}

`

type ValidatedUserDataType = {
	username: string;
	email: string;
	password: string;
	referredBy: Types.ObjectId;
}


export const Query = {
	queues: async () => await Queue.findAll(),
	queue: async (_: void, {name}: { name: string }) => await Queue.findByName(name),

	user: (_: void, {username}: { username: string }) => User.findByIdentifier(username),
	challenge: (_: void, { challengeId } : { challengeId: Types.ObjectId }) => Challenge.viewChallenge(challengeId),
	validate: async (_: void, { validatedUserData, token }: { validatedUserData: ValidatedUserDataType; token: string }) => {
		const validationPromises = Object.entries(validatedUserData)
			.map(([validatedField, validatedValue]) => getValidatedResolver(validatedField)(validatedValue as string, token))
		// TODO: Test this shit pls
		return Promise.all(validationPromises)
	}
}

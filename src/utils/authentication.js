import jwt from 'jsonwebtoken'

import { AuthToken } from '../graphql/types/User/AuthToken'

// TODO migrate as user method somehow
export const authentication = token => new Promise((resolve, reject) => {
    const data = jwt.verify(token, process.env.JWT_KEY)
	return AuthToken.findRecord(token).then(tokenRecord => {
		if (!tokenRecord) {
			return reject(new Error("Invalid token"));
		}
		return tokenRecord.populate('user').execPopulate()
	}).then(populatedTokenRecord => {
		if (!populatedTokenRecord) {
			return reject(new Error('User not found'))
		}
		return resolve(populatedTokenRecord.user)
	}).catch(error => {
		return reject(error)
	})
})

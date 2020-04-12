import jwt from 'jsonwebtoken'

import { UserType } from '../graphql/models/User'
import AuthToken from '../graphql/models/User/AuthToken'

// TODO migrate as user method somehow
export const authentication = (token: string) => new Promise<UserType>((resolve, reject) => {
    const data = jwt.verify(token, process.env.JWT_KEY)
	return AuthToken.findRecord(token).then((tokenRecord: any) => {
		if (!tokenRecord) {
			return reject(new Error("Invalid token"));
		}
		return tokenRecord.populate('user').execPopulate()
	}).then((populatedTokenRecord: any) => {
		if (!populatedTokenRecord) {
			return reject(new Error('User not found'))
		}
		return resolve(populatedTokenRecord.user)
	}).catch((error: any) => {
		return reject(error)
	})
})

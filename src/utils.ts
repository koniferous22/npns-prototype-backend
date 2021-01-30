import jwt from 'jsonwebtoken'
import { configuration } from '../config/index';
import { UserModel } from './models/user';
import { AuthTokenModel } from './models/authToken';

export const authHelper = async (token: string) => {
  const data = jwt.verify(token, configuration.jwtKey);
  const authTokenRecord = await AuthTokenModel.findRecord(token);
  if (!authTokenRecord) {
    throw new Error(`Found invalid token: ${token}`);
  }
  const user = await UserModel.findOne({ _id: authTokenRecord.user });
  if (!user) {
    throw new Error(`No user for related to the token: ${authTokenRecord.token}`);
  }
  return user;
}

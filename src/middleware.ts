import { UserModel } from './models/user';
import { ChallengeModel } from './models/challenge';
import { VerificationTokenModel } from './models/verificationToken';
import { authHelper } from './utils';
import { UserType } from './models/user';
// NOTE middlewares are temporary solution, because unhappy path handling is fucking hell

// NOT I was just too lazy testing whether you can wrap middlewares

const findTokenHelper = async (emailToken: string) => {
  const token = await VerificationTokenModel.findOne({ token: emailToken });
  if (!token) {
    throw new Error(`Token ${emailToken} not found`);
  }
  return token;
}

export const auth = async (
  resolve: any,
  source: any,
  args: {
    authToken: 'String!'
  },
  context: any,
  info: any
) => {
  const user = await authHelper(args.authToken);
  resolve(source, { ...args, user }, context, info);
}

export const passwordValidation = async (
  resolve: any,
  source: any,
  args: {
    // NOTE UserITC expected here
    user: UserType,
    password: string;
  },
  context: any,
  info: any
) => {
  try {
    if (await args.user.isPasswordValid(args.password)) {
      return resolve(source, args, context, info);
    }
  } catch (e) {
    throw new Error(`Invalid password for user ${args.user.username}`);
  }
}

export const createUserMiddleware = async (
  resolve: any,
  source: any,
  args: {
    username: string;
    password: string;
    email: string;
    firstName?: string;
    lastName?: string;
  },
  context: any,
  info: any
) => {
  const user = new UserModel(args);
  await user.save()
  return resolve(
    source,
    {
      ...args,
      email: {
        to: args.email,
        template: 'signUpTemplate',
        token: 'kokot'
      }
    },
    context,
    info
  );
}

export const tokenizedOperationMiddleware = async (
  resolve: any,
  source: any,
  args: {
    emailToken: 'String!'
  },
  context: any,
  info: any
) => {
  const token = await findTokenHelper(args.emailToken);
  const user = await UserModel.findOne({ _id : token.user });
  if (!user) {
    throw new Error(`User ${token.user} not found`);
  }
  // Had to create two separate args, otherwise would have to define custom input types - 3 lazy 3 do taht
  const result = await resolve(source, { ...args, profileOperationUser: user, profileOperationToken: token }, context, info);
  // NOTE test if it's possible to pass extra data to args in graphql
  // console.log(JSON.stringify(user, null, 2));
  await VerificationTokenModel.deleteAllBy(user._id);

  return result;
}

export const prefetchUser = async (
  resolve: any,
  source: any,
  args: {
    identifier: 'String!'
  },
  context: any,
  info: any
) => {
  const user = await UserModel.findByIdentifier(args.identifier)
  if (!user) {
    throw new Error(`No user with identifier ${args.identifier} found`);
  }
  resolve(source, args, context, info)
}

export const prefetchChallenge = async (
  resolve: any,
  source: any,
  args: {
    challengeId: 'MongoID!'
  },
  context: any,
  info: any
) => {
  const challenge = await ChallengeModel.findById(args.challengeId);
  if (!challenge) {
    throw new Error(`No challenge with id ${args.challengeId} found`);
  }
  resolve(source, { ...args, challenge }, context, info);
}
import { schemaComposer, Resolver, ResolverMiddleware } from 'graphql-compose';
import { QueueTC } from './type-composers/queue';
import { ChallengeTC } from './type-composers/challenge';
import { UserTC } from './type-composers/user';
import {
  auth,
  passwordValidation,
  prefetchChallenge,
  prefetchUser,
  tokenizedOperationMiddleware
} from './middleware';

const applyMiddleware = (
  middleWares: ResolverMiddleware<any, any>[],
  removedArgs: string | string[],
  addedArgs: any
) => (resolvers: Record<string, Resolver>) => {
  Object.keys(resolvers).forEach((resolverName) => {
    resolvers[resolverName] = resolvers[resolverName]
      .withMiddlewares(middleWares)
      .removeArg(removedArgs)
      .addArgs(addedArgs)
  });
  return resolvers
}

const applyAuth = applyMiddleware([auth], 'user', {
  identifier: 'String!'
});
const applyPwdValidation = applyMiddleware([passwordValidation], [], {
  password: 'String!'
});
const applyPrefetchUser = applyMiddleware([prefetchUser], 'user', {
  identifier: 'String!'
});
const applyPrefetchChallenge = applyMiddleware([prefetchChallenge], 'challenge', {
  challengeId: 'String!'
});
const applyTokenizedOperation = applyMiddleware([tokenizedOperationMiddleware], ['profileOperationUser', 'profileOperationToken'], {
  emailToken: 'String!'
});

const apply = (applications: Array<ReturnType<typeof applyMiddleware>>, resolvers: Record<string, Resolver>) => {
  const shallowCopy = [...applications].reverse();
  let result = resolvers;
  shallowCopy.forEach((application) => {
    result = application(result);
  })
  return result;
}

schemaComposer.Query.addFields({
  queueFindByName: QueueTC.getResolver('findByName'),
  queueFindAll: QueueTC.getResolver('findAll'),
  challengeView: ChallengeTC.getResolver('viewChallenge'),
  userFindByIdentifier: UserTC.getResolver('findByIdentifier'),
  validatePasswordResetToken: UserTC.getResolver('validatePasswordResetToken'),
  validateUsername: UserTC.getResolver('validateUsername'),
  validateEmail: UserTC.getResolver('validateEmail'),
  validateReferral: UserTC.getResolver('validateReferral'),
  ...applyAuth({
    validatePasswordIdentity: UserTC.getResolver('validatePasswordIdentity')
  })
});

schemaComposer.Mutation.addFields({
  // TODO MISSING PERMISSION
  queueCreateOne: QueueTC.getResolver('createQueue'),
  userSignIn: UserTC.getResolver('signIn'),
  userRequestSignUp: UserTC.getResolver('requestSignUp'),
  ...apply([applyAuth, applyPrefetchChallenge] ,{
    challengeBoost: ChallengeTC.getResolver('boostChallenge'),
    challengePostSubmission: ChallengeTC.getResolver('postSubmission'),
    challengePostReply: ChallengeTC.getResolver('postReply'),
    challengeEdit: ChallengeTC.getResolver('editChallenge'),
    challengeEditSubmission: ChallengeTC.getResolver('editSubmission'),
    challengeEditReply: ChallengeTC.getResolver('editReply'),
    challengeMarkSolved: ChallengeTC.getResolver('markSolved')
  }),
  ...applyAuth({
    challengePost: ChallengeTC.getResolver('postChallenge'),
    userKeepAlive: UserTC.getResolver('keepAlive'),
    userLogout: UserTC.getResolver('logout'),
    userLogoutAllDevices: UserTC.getResolver('logoutAllDevices'),
    userChangeNames: UserTC.getResolver('changeNames'),
    userRequestPasswordResetFromProfile: UserTC.getResolver('requestPasswordReset'),
  }),
  ...applyPrefetchUser({
    userRequestPasswordReset: UserTC.getResolver('requestPasswordReset'),
    userResendSignUpRequest: UserTC.getResolver('resendSignUpRequest'),
  }),
  ...apply([applyAuth, applyPwdValidation], {
    userRequestUsernameChange: UserTC.getResolver('requestUsernameChange'),
    userRequestEmailChange: UserTC.getResolver('requestEmailChange')
  }),
  ...apply([applyPrefetchUser, applyPwdValidation], {
    userConfirmPasswordReset: UserTC.getResolver('confirmPasswordReset')
  }),
  ...applyTokenizedOperation({
    userVerify: UserTC.getResolver('verifyUser'),
    userApplyTokenizedEmailChange: UserTC.getResolver('applyTokenizedEmailChange'),
    userApplyTokenizedUsernameChange: UserTC.getResolver('applyTokenizedUsernameChange')
  })
});

export const graphqlSchema = schemaComposer.buildSchema();

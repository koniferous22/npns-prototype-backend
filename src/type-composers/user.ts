import mongoose from 'mongoose'; 
import validator from 'validator';
import { Resolver } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { UserModel, UserType } from '../models/user';
import { AuthTokenModel } from '../models/authToken';
import {
  VerificationTokenModel,
  VerificationTokenType,
  SIGN_UP
} from '../models/verificationToken';
import { sendMail, templates } from '../external/nodemailer';
import { MessagePayloadTC } from './payload';
import { ArgsType } from '../utilTypes';
import { validationResolverFactory } from './validationResolverFactory';
import { UserITC } from './utilInputTypes';

export let UserTC = composeMongoose(UserModel, {});


UserTC.addResolver({
  name: 'findByIdentifier',
  args: {
    identifier: 'String!'
  },
  type: UserTC,
  // @ts-expect-error
  resolve: ({ args }) => UserModel.findByIdentifier(args.identifier)
});

UserTC.addResolver({
  name: 'signIn',
  args: {
    identifier: 'String!',
    password: 'String!'
  },
  type: `
    type UserSignInPayload {
      user: User,
      token: String
    }
  `,
  // @ts-expect-error
  resolve: async ({ args }) => {
    const user = await UserModel.findByIdentifier(args.identifier);
    if (!user) {
      throw new Error('Invalid login credentials')
    }
    const hasValidPassword = await user.isPasswordValid(args.password);
    if (!hasValidPassword) {
      throw new Error('Invalid login credentials')
    }
    if (!user.verified) {
      throw new Error('not verified, check your email')
    }
    const { token } = await AuthTokenModel.generate(user.id);
    return {
      user,
      token
    };
  }
});

UserTC.addResolver({
  name: 'logout',
  args: {
    token: 'String!'
  },
  type: 'String',
  // @ts-expect-error
  resolve: async ({ args }) => {
    await AuthTokenModel.deleteOne({ token: args.token });
    return {
      message: 'Logged out'
    };
  }
});

UserTC.addResolver({
  name: 'logoutAllDevices',
  args: {
    user: UserITC,
    token: 'String!'
  },
  type: MessagePayloadTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    await AuthTokenModel.deleteMany({ user: args.user._id });
    return {
      message: 'Logged out'
    };
  }
});

const createProfileUpdateRequestResolver = ({
  name,
  args,
  documentFactory,
  mail
}: {
  name: string;
  args: ArgsType<typeof UserTC>;
  documentFactory: (resolverArgs: ArgsType<typeof UserTC>) => {
    token: VerificationTokenType;
    user?: UserType;
  };
  mail?: {
    getRecipient: (resolverArgs: ArgsType<typeof UserTC>) => string;
    template: keyof typeof templates;
  }
}) => ({
  name,
  args,
  type: MessagePayloadTC,
  resolve: async ({ args }: { args: ArgsType<typeof UserTC> }) => {
    const docs = documentFactory(args);
    await docs.token.save();
    if (docs.user) {
      await docs.user.save();
    }
    if (mail) {
      await sendMail(mail.getRecipient(args), mail.template, docs.token.token);
    }
    return {
      message: 'Profile update requested'
    };
  }
})

UserTC.addResolver(createProfileUpdateRequestResolver({
  name: 'requestPasswordReset',
  args: {
    user: UserITC,
    payload: 'String'
  },
  documentFactory: (args) => ({
    // @ts-expect-error
    token: new VerificationTokenModel({ user: args.user._id })
  }),
  mail: {
    template: 'pwdResetTemplate',
    // @ts-expect-error
    getRecipient: (args) => args.user.email
  }
}));

UserTC.addResolver(createProfileUpdateRequestResolver({
  name: 'requestUsernameChange',
  args: {
    user: UserITC,
    payload: 'String'
  },
  documentFactory: (args) => ({
    // @ts-expect-error
    token: new VerificationTokenModel({ user: args.user._id, newUsername: args.payload })
  }),
  mail: {
    template: 'usernameChangeTemplate',
    // @ts-expect-error
    getRecipient: (args) => args.user.email
  }
}));

UserTC.addResolver(createProfileUpdateRequestResolver({
  name: 'requestSignUp',
  args: {
    username: 'String!',
    email: 'String!',
    password: 'String!',
    firstName: 'String',
    lastName: 'String'
  },
  documentFactory: (args) => {
    const user = new UserModel(args);
    return {
      token: new VerificationTokenModel({ type: SIGN_UP, user: user._id }),
      user
    }
  },
  mail: {
    template: 'signUpTemplate',
    // @ts-expect-error
    getRecipient: (args) => args.email
  }
}));

UserTC.addResolver(createProfileUpdateRequestResolver({
  name: 'requestEmailChange',
  args: {
    user: UserITC,
    payload: 'String'
  },
  documentFactory: (args) => ({
    // @ts-expect-error
    token: new VerificationTokenModel({ user: args.user._id, newEmail: payload }),
  }),
  mail: {
    template: 'emailChangeTemplate',
    // @ts-expect-error
    getRecipient: (args) => args.payload
  }
}));

UserTC.addResolver({
  name: 'changeNames',
  args: {
    user: UserITC,
    newFirstName: 'String',
    newLastName: 'String'
  },
  type:  MessagePayloadTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    await UserModel.updateOne({ _id: args.user._id }, {
      firstName: args.newFirstName ?? args.user.firstName,
      newLastName: args.newLastName ?? args.user.newLastName
    });
    return {
      message: 'Profile updated'
    }
  }
});


UserTC.addResolver({
  name: 'confirmPasswordReset',
  args: {
    profileOperationUser: UserITC,
    newPassword: 'String!'
  },
  type: MessagePayloadTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    const newPassword = await UserModel.generatePasswordHash(args.newPassword);
    await UserModel.updateOne({ _id : args.profileOperationUser._id }, { password: newPassword });
    await AuthTokenModel.deleteMany({ user: args.profileOperationUser._id })
    return {
      message: 'Password changed, continue to login'
    };
  }
})

UserTC.addResolver({
  name: 'verifyUser',
  args: {
    profileOperationUser: UserITC 
  },
  type: MessagePayloadTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    // TODO I'm really curious if this shit actually works
    const user = args.profileOperationUser;

    user.setUserVerified(true);
    await user.save()
    return {
      message: `User "${user.username}" status set to verified`
    };
  }
})

// Middleware cannot be reused because Verifcation tokens are deleted before operation
UserTC.addResolver({
  name: 'resendSignUpRequest',
  args: {
    user: UserITC
  },
  type: MessagePayloadTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    if (args.user.verified) {
      throw new Error(`User ${args.user.username} is already verified`);
    }
    await VerificationTokenModel.deleteMany({user: args.user._id})
    const token = new VerificationTokenModel({type: SIGN_UP, user: args.user._id})
    return {
      message: `Request resent, check your email adress "${args.user.email}"`
    }
  }
});

UserTC.addResolver({
  name: 'applyTokenizedEmailChange',
  args: {
    profileOperationUser: UserITC,
    profileOperationToken: `
      input ApplyTokenizedEmailChangeTokenInput {
        token: String!
        newEmail: String!
      }
    `,
  },
  type: MessagePayloadTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    args.profileOperationUser.email = args.profileOperationToken.newEmail;
    await args.profileOperationUser.save();
    await AuthTokenModel.deleteMany({ user: args.profileOperationUser._id })
    return {
      message: `User email has been updated to "${args.profileOperationToken.newEmail}"`
    }
  }
});

UserTC.addResolver({
  name: 'applyTokenizedUsernameChange',
  args: {
    profileOperationUser: UserITC,
    profileOperationToken: `
      input ApplyTokenizedUsernameChangeTokenInput {
        token: String!
        newUsername: String!
      }
    `,
  },
  type: MessagePayloadTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    args.profileOperationUser.username = args.profileOperationToken.newUsername;
    await args.profileOperationUser.save();
    await AuthTokenModel.deleteMany({ user: args.profileOperationUser._id })
    return {
      message: `Username has been updated to "${args.profileOperationToken.newUsername}"`
    }
  }
});

UserTC.addResolver({
  name: 'keepAlive',
  args: {},
  type: MessagePayloadTC,
  resolve: () => ({
    message: 'Keep alive'
  })
});

UserTC.addResolver(validationResolverFactory<typeof UserTC>({
  name: 'validatePasswordResetToken',
  args: {
    emailToken: 'String!'
  },
  // @ts-ignore
  validationFn: async ({ args }: {args: ArgsType<typeof UserTC> & {
    emailToken: string;
  }}) => {
    const token = await VerificationTokenModel.findOne({ token: args.emailToken });
    if (!token) {
      return `Token ${args.emailToken} not found`;
    }
    const user = await UserModel.findById(token.user);
    if (!user) {
      return `Related user with password reset token "${args.emailToken}"`;
    }
    await AuthTokenModel.deleteMany({ user: user._id });
    return true;
  }
}));

UserTC.addResolver(validationResolverFactory<typeof UserTC>({
  name: 'validateUsername',
  args: {
    username: 'String!'
  },
  // @ts-ignore
  validationFn: async ({ args }: {args: {
    username:string;
  }}) => {
    if (args.username === '') {
      return 'No username submitted'
    }
    const userWithUsername = await UserModel.findByIdentifier(args.username);
    if (userWithUsername) {
      return 'Username taken'
    }
    return true
  }
}));

UserTC.addResolver(validationResolverFactory<typeof UserTC>({
  name: 'validateEmail',
  args: {
    email: 'String!'
  },
  // @ts-ignore
  validationFn: async ({ args }: {args: {
    email:string;
  }}) => {
    if (!validator.isEmail(args.email)) {
      return 'Invalid email';
    }
    const userWithEmail = await UserModel.findByIdentifier(args.email)
    if (userWithEmail) {
      return 'Email taken'
    }
    return true
  }
}));

UserTC.addResolver(validationResolverFactory<typeof UserTC>({
  name: 'validateReferral',
  args: {
    referredBy: 'String!'
  },
  // @ts-ignore
  validationFn: async ({ args }: {
    referredBy: string;
  }) => {
    if (args.referredBy === '') {
      throw new Error('No referal user specified')
    }
    const referal = await UserModel.findByIdentifier(args.referredBy)
    if (!referal) {
      throw new Error('Entered invalid referal')
    }
    return true
  }
}));

UserTC.addResolver(validationResolverFactory<typeof UserTC>({
  name: 'validatePasswordIdentity',
  args: {
    password: 'String!',
    user: UserITC
  },
  // @ts-ignore
  validationFn: async ({ args }: {
    user: any
  }) => {
    const isPasswordUsed = args.user.isPasswordValid(args.password);
    if (!isPasswordUsed) {
      return 'Password is same as current one';
    }
    return true;
  }
}));

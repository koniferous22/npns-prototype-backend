import mongoose from 'mongoose'; 
import { Resolver } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { UserITC, ChallengeITC } from './utilInputTypes';
import { ChallengeModel } from '../models/challenge';
import { UserModel } from '../models/user';

export const ChallengeTC = composeMongoose(ChallengeModel, {});

export const ChallengeConnection: Resolver = ChallengeTC.mongooseResolvers.connection({
  sort: {
    BOUNTY_DESC: {
      value: {
        bounty: -1,
        _id: 1
      },
      cursorFields: ['bounty', '_id'],
      beforeCursorQuery: (rawQuery, cursorData, resolveParams) => {
        if (!rawQuery.bounty) {
          rawQuery.bounty = {};
        }
        if (!rawQuery._id) {
          rawQuery._id = {};
        }
        rawQuery.bounty.$gt = cursorData.bounty;
        rawQuery._id.$lt = cursorData._id;
      },
      afterCursorQuery: (rawQuery, cursorData, resolveParams) => {
        if (!rawQuery.bounty) {
          rawQuery.bounty = {};
        }
        if (!rawQuery._id) {
          rawQuery._id = {};
        }
        rawQuery.bounty.$lt = cursorData.bounty;
        rawQuery._id.$gt = cursorData._id;
      }
    }
  }
});

// NOTE auth permission
ChallengeTC.addResolver({
  name: 'postChallenge',
  args: {
    user: UserITC,
    queue: 'MongoID!',
    title: 'String!',
    content: 'String!'
  },
  type: ChallengeTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    const challenge = new ChallengeModel({
      contentMeta: {
        submittedBy: args.user._id,
        content: args.content
      },
      queue: args.queue,
      title: args.title
    });
    await challenge.save();
    return challenge;
  }
})

ChallengeTC.addResolver({
  name: 'viewChallenge',
  args: {
    challenge: ChallengeITC
  },
  type: ChallengeTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    const challenge = await ChallengeModel.findById(args.challengeId);
    if (!challenge) {
      throw new Error(`No challenge with id ${args.challengeId} found`);
    }
    challenge.viewCount++;
    await challenge.save();
    return challenge;
  }
})

// WRAP in auth
ChallengeTC.addResolver({
  name: 'boostChallenge',
  args: {
    user: UserITC,
    challenge: 'MongoID!',
    boostValue: 'Int!'
  },
  type: ChallengeTC,
  // TODO wrap in auth wrapper
  // @ts-expect-error
  resolve: async ({ args }) => {
    const challenge = await ChallengeModel.findById(args.challengeId);
    if (!challenge) {
      throw new Error(`No challenge with id ${args.challengeId} found`);
    }
    if (challenge.acceptedSubmission) {
      throw new Error('Cannot boost solved challenge')
    }
    if (args.boostedValue <= 0) {
      throw new Error('Boost value has to be positive')
    }
    // @ts-expect-error
    challenge.boosts.push({
      boostedBy: args.user._id,
      boostAmount: args.boostValue
    });
    await challenge.save();
    return challenge;
  }
});

ChallengeTC.addResolver({
  name: 'postSubmission',
  args: {
    user: UserITC,
    challenge: ChallengeITC,
    content: 'String!'
  },
  type: ChallengeTC,
  // @ts-expect-error   
  resolve: async ({ args }) => {
    const challenge = await ChallengeModel.findById(args.challengeId);
    if (!challenge) {
      throw new Error(`No challenge with id ${args.challengeId} found`);
    }
    // @ts-expect-error
    const newSubmission = challenge.submissions.create({
      contentMeta: {
        submittedBy: args.user._id,
        content: args.content
      }
    })
    challenge.submissions.push(newSubmission);
    await challenge.save();
    return challenge;
  }
})

ChallengeTC.addResolver({
  name: 'postReply',
  args: {
    user: UserITC,
    challenge: ChallengeITC,
    submissionId: 'MongoID!',
    content: 'String!'
  },
  type: ChallengeTC,
  // @ts-expect-error   
  resolve: async ({ args }) => {
    const challenge = await ChallengeModel.findById(args.challengeId);
    if (!challenge) {
      throw new Error(`No challenge with id ${args.challengeId} found`);
    }
    // @ts-expect-error
    const submission = challenge.submissions.id(args.submissionId);
    if (!submission) {
      throw new Error(`No submission with id: ${args.submissionId} found`);
    }
    const newReply = submission.replies.create({
      contentMeta: {
        submittedBy: args.user._id,
        content: args.content
      }
    })
    submission.replies.push(newReply);
    await challenge.save();
    return challenge;
  }
})

ChallengeTC.addResolver({
  name: 'editChallenge',
  args: {
    user: 'MongoID!',
    challenge: ChallengeITC,
    content: 'String!'
  },
  type: ChallengeTC,
  // @ts-expect-error   
  resolve: async ({ args }) => {
    const challenge = await ChallengeModel.findById(args.challengeId);
    if (!challenge) {
      throw new Error(`No challenge with id ${args.challengeId} found`);
    }
    // @ts-expect-error
    const newEdit = challenge.edits.create({
      contentMeta: {
        submittedBy: args.user._id,
        content: args.content
      }
    })
    challenge.edits.push(newEdit);
    await challenge.save();
    return challenge;
  }
})

ChallengeTC.addResolver({
  name: 'editSubmission',
  args: {
    user: 'MongoID!',
    challenge: ChallengeITC,
    submissionId: 'MongoID!',
    content: 'String!'
  },
  type: ChallengeTC,
  // @ts-expect-error   
  resolve: async ({ args }) => {
    const challenge = await ChallengeModel.findById(args.challengeId);
    if (!challenge) {
      throw new Error(`No challenge with id ${args.challengeId} found`);
    }
    // @ts-expect-error
    const submission = challenge.submissions.id(args.submissionId);
    if (!submission) {
      throw new Error(`No submission with id: ${args.submissionId} found`);
    }
    const newEdit = submission.edits.create({
      contentMeta: {
        submittedBy: args.user._id,
        content: args.content
      }
    })
    submission.edits.push(newEdit);
    await challenge.save();
    return challenge;
  }
})

ChallengeTC.addResolver({
  name: 'editReply',
  args: {
    user: 'MongoID!',
    challenge: ChallengeITC,
    submissionId: 'MongoID!',
    replyId: 'MongoID!',
    content: 'String!'
  },
  type: ChallengeTC,
  // @ts-expect-error   
  resolve: async ({ args }) => {
    const challenge = await ChallengeModel.findById(args.challengeId);
    if (!challenge) {
      throw new Error(`No challenge with id ${args.challengeId} found`);
    }
    // @ts-expect-error
    const submission = challenge.submissions.id(args.submissionId);
    if (!submission) {
      throw new Error(`No submission with id: ${args.submissionId} found`);
    }
    const reply = submission.replies.id(args.submissionId);
    if (!reply) {
      throw new Error(`No reply with id: ${args.replyId} found`);
    }
    const newEdit = reply.edits.create({
      contentMeta: {
        submittedBy: args.user._id,
        content: args.content
      }
    })
    reply.edits.push(newEdit);
    await challenge.save();
    return challenge;
  }
})

const KARMA_VALUE = 1;

// WRAP in auth and content owner scope
ChallengeTC.addResolver({
  name: 'markSolved',
  args: {
    challenge: ChallengeITC,
    submissionId: 'MongoID!'
  },
  type: ChallengeTC,
  // @ts-expect-error
  resolve: async ({ args }) => {
    const challenge = await ChallengeModel.findById(args.challengeId);
    if (!challenge) {
      throw new Error(`No challenge with id ${args.challengeId} found`);
    }
    // @ts-expect-error
    const submission = challenge.submissions.id(args.submissionId);
    if (!submission) {
      throw new Error(`No submission with id: ${args.submissionId} found`);
    }
    const winner = await UserModel.findOne({id: submission.contentMeta.submittedBy})
    if (!winner) {
      throw new Error(`Winner record not found for submission: ${submission._id}`);
    }
    challenge.acceptedSubmission = submission;
    challenge.isSolved = true;

    const amount = challenge.bounty ?? 0;
    const karmaAmount = KARMA_VALUE;

    // @ts-expect-error
    winner.transactions.push({
      type: 'KOKOT',
      from: 'NPNS_team.biz',
      to: winner._id,
      amount,
      // TODO change or sth
      karmaAmount,
      meta: {
        relatedQueue: challenge.queue
      }
    })
    let karmaEntry = winner.karmaEntries.find(({ queue }) => queue === challenge.queue)
    if (!karmaEntry) {
      // @ts-expect-error
      karmaEntry = winner.karmaEntries.create({
        queue: challenge.queue,
        karma: karmaAmount 
      })
      // @ts-expect-error
      winner.karmaEntries.push(karmaEntry)
    } else {
      karmaEntry.karma += karmaAmount
    }
    winner.wallet += amount
    // TODO transaction
    await Promise.all([challenge.save(), winner.save()])
    return challenge;
  }
});

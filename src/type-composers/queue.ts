import { composeMongoose } from 'graphql-compose-mongoose';
// import { prepareConnectionResolver } from 'graphql-compose-connection';
import { QueueType, QueueModel } from '../models/queue';
import { ChallengeModel } from '../models/challenge';
import { ChallengeConnection } from './challenge';

export const QueueTC = composeMongoose(QueueModel, {});
   
QueueTC.addResolver({
  name: 'createQueue',
  args: {
    name: 'String!',
    parentName: 'String!',
    karmaValue: 'Int'
  },
  type: QueueTC,
  // @ts-expect-error
  resolve: ({ args }) => QueueModel.createQueue(args.name, args.parentName, args.karmaValue)
});

QueueTC.addResolver({
  name: 'findByName',
  args: {
    name: 'String!'
  },
  type: QueueTC,
  // @ts-expect-error
  resolve: ({ args }) => QueueModel.findOne({ name: args.name })
});

QueueTC.addResolver({
  name: 'findRoot',
  args: {},
  type: QueueTC,
  resolve: () => QueueModel.findOne({ leftIndex: 0 })
});

QueueTC.addResolver({
  name: 'findAll',
  args: {},
  type: [QueueTC],
  resolve: () => QueueModel.find({})
});

QueueTC.addFields({
  challenges: ChallengeConnection.wrapResolve(next => rp => {
    rp.args.filter = {
      _id: {
        $in: rp.source.descendants
      }
    }
    next(rp);
  }).removeArg('filter'),
  parent: {
    type: QueueTC,
    resolve: (queue: QueueType) => QueueModel.findOne({ _id: queue.parent })
  },
  children: {
    type: [QueueTC],
    resolve: (queue: QueueType) => QueueModel.find({ _id: { $in: queue.children }})
  },
  ancestors: {
    type: [QueueTC],
    resolve: (queue: QueueType) => QueueModel.find({ _id: { $in: queue.ancestors }})
  },
  descendants: {
    type: [QueueTC],
    resolve: (queue: QueueType) => QueueModel.find({ _id: { $in: queue.descendants }})
  }
});

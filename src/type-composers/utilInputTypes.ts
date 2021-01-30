import { schemaComposer } from 'graphql-compose';

export const UserITC = schemaComposer.createInputTC(`
  input UserHiddenInput {
    _id: MongoID!
  }
`);

export const ChallengeITC = schemaComposer.createInputTC(`
  input ChallengeHiddenInput {
    _id: MongoID!
  }
`);
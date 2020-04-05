import "core-js/stable"
import "regenerator-runtime/runtime"
import custom_environments from 'custom-env';

import mongoose from 'mongoose';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

import dbConfig from './db';
import { typeDefs, resolvers } from './graphql';

custom_environments.env()
custom_environments.env(process.env.NODE_ENV,'cfg/environments')

mongoose.connect(process.env.MONGODB_HOST, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);

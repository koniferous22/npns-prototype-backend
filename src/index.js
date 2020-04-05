const custom_environments = require('custom-env')
custom_environments.env()
custom_environments.env(process.env.NODE_ENV,'cfg/environments')

const dbConfig = require('./db');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_HOST, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const express = require('express');

const { ApolloServer, gql } = require('apollo-server-express')

const { typeDefs, resolvers } = require('./graphql')

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);

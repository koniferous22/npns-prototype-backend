const custom_environments = require('custom-env')
custom_environments.env()
custom_environments.env(process.env.NODE_ENV,'cfg/environments')

const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const mongoose = require('mongoose');

const Queue = require('./models/queue')

const dbConfig = require('./db');
// Connect to DB
mongoose.connect(process.env.MONGODB_HOST, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);

import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server';
import { configuration } from '../config/index';
import { graphqlSchema } from './schema';

const main = async () => {
  // TODO set
  mongoose.connect(configuration.dbUrl);
  const server = new ApolloServer({ schema: graphqlSchema });
  const port = 3000;
  await server.listen(port);
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}
main();


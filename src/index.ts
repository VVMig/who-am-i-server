import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { typeDefs, resolvers } from './gql';

dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: {
    origin: '*',
  },
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

mongoose.connect(
  process.env.MONGODB_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (!err) {
      console.error(err);
    }
    console.log('Mongodb ready');
  }
);

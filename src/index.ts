import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { typeDefs, resolvers } from './gql';
import { corsConfigs } from './configs';

dotenv.config();

const app = express();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use(cookieParser());
app.use(cors(corsConfigs));

app.use(
  '/graphql',
  express.json(),
  graphqlExpress((req, res) => {
    return {
      schema,
      context: {
        cookies: req.cookies,
        res,
      },
    };
  })
);

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(4000, () => {
  console.log('Go to http://localhost:4000/graphiql to run queries!');
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
    if (err) {
      console.error(err);
    }
    console.log('Mongodb ready');
  }
);

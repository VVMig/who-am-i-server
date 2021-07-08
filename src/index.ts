import express from 'express';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { execute, subscribe } from 'graphql';

import { typeDefs, resolvers } from './gql';
import { corsConfigs } from './configs';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

const PORT = process.env.PORT || 4000;

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

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
  })
);

const ws = createServer(app);

ws.listen(PORT, () => {
  console.log(`Apollo Server is now running on http://localhost:${PORT}`);
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server: ws,
      path: '/subscriptions',
    }
  );
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const graphql_tools_1 = require("graphql-tools");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const graphql_1 = require("graphql");
const gql_1 = require("./gql");
const configs_1 = require("./configs");
const http_1 = require("http");
const subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
const PORT = process.env.PORT || 4000;
dotenv_1.default.config();
const app = express_1.default();
const schema = graphql_tools_1.makeExecutableSchema({
    typeDefs: gql_1.typeDefs,
    resolvers: gql_1.resolvers,
});
app.use(cookie_parser_1.default());
app.use(cors_1.default(configs_1.corsConfigs));
app.use('/graphql', express_1.default.json(), apollo_server_express_1.graphqlExpress((req, res) => {
    return {
        schema,
        context: {
            cookies: req.cookies,
            res,
        },
    };
}));
app.use('/graphiql', apollo_server_express_1.graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `wss://who-am-i-game-server.herokuapp.com/subscriptions`,
}));
const ws = http_1.createServer(app);
ws.listen(PORT, () => {
    console.log(`Apollo Server is now running on https://who-am-i-game-server.herokuapp.com`);
    new subscriptions_transport_ws_1.SubscriptionServer({
        execute: graphql_1.execute,
        subscribe: graphql_1.subscribe,
        schema,
    }, {
        server: ws,
        path: '/subscriptions',
    });
});
mongoose_1.default.connect(process.env.MONGODB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}, (err) => {
    if (err) {
        console.error(err);
    }
    console.log('Mongodb ready');
});

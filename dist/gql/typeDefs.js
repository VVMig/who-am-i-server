"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_1 = require("apollo-server");
exports.typeDefs = apollo_server_1.gql `
  type Answer {
    id: ID
    value: Boolean
    isGuessed: Boolean
  }

  type Question {
    from: ID
    value: String
  }

  type Room {
    id: ID!
    shareId: String
    participants: [GameUser]
    maxParticipants: Int
    gameStage: String
    question: Question
    answers: [Answer]
    step: Int
  }

  type RangeParticipants {
    min: Int
    max: Int
    defaultValue: Int
  }

  type GameUser {
    id: ID!
    displayName: String
    color: String
    guessName: String
    room: Room
    isAdmin: Boolean
    isFinish: Boolean
    namingUser: GameUser
    seterUser: GameUser
    correctAnswers: Int
  }

  type Query {
    getGameUser(id: ID!): GameUser
    getRoom(shareId: String!): Room
    getRangeParticipants: RangeParticipants
    isRoomExist: Boolean
    authorize: GameUser
  }

  type Mutation {
    createRoom(maxParticipants: Int): Room!
    createGameUser(shareId: String!): GameUser
    joinRoom(shareId: String): Room
    leaveRoom: String
    reconnectRoom: Room
    kickPlayer(id: String!): Room
    waitStageNext: Room
    guessName(id: String!, name: String!): Room
    nameStageNext: Room
    sendQuestion(question: String): Room
    sendAnswer(answer: Boolean, isGuessed: Boolean): Room
  }

  type Subscription {
    gameUserUpdate(shareId: String): Room
    kickedGameUser(id: String): String
    roomStage(shareId: String): Room
  }
`;

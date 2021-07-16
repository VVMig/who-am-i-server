import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Room {
    id: ID!
    shareId: String
    participants: [GameUser]
    maxParticipants: Int
    gameStage: String
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
  }

  type Query {
    getGameUser(id: ID!): GameUser
    getRoom(shareId: String!): Room
    getRangeParticipants: RangeParticipants
    isRoomExist: Boolean
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
  }

  type Subscription {
    gameUserUpdate(shareId: String): Room
    kickedGameUser(id: String): String
    roomStage(shareId: String): Room
  }
`;

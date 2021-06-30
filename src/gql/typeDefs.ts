import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Room {
    id: ID!
    shareId: String
    participants: [GameUser]
    maxParticipants: Int
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
  }

  type GameInformation {
    gameUser: GameUser
    roomShare: Room
  }

  input GameInformationInput {
    gameUserId: String
    roomShareId: String
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
  }
`;

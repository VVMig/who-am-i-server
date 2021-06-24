import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Room {
    id: ID!
    shareId: String
    participants: [GameUser]
    maxParticipants: String
  }

  type GameUser {
    id: ID!
    displayName: String
    color: String
    guessName: String
    room: Room
  }

  type Query {
    getGameUser(id: ID!): GameUser
    getRoom(shareId: String!): Room
  }

  type Mutation {
    createRoom(maxParticipants: String): Room!
    createGameUser(shareId: String!): GameUser
  }
`;

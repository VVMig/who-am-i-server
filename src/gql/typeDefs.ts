import { gql } from 'apollo-server';

export const typeDefs = gql`
  type User {
    id: ID!
    name: String
  }

  type Query {
    getUser: User
  }
`;

import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    authUser: User!
    loginUser(email: String!, password: String!): AuthUser!
    getAllUser: [User!]
    getUserById(user_id: ID): User!
  }

  extend type Mutation {
    registerUser(newUser: UserInput!): AuthUser!
    setUserRoleById(user_id: ID, setRole: UserRoles): User!
    changeUserData(user_id: ID, firstName: String, lastName: String): User!
    changeUserEmail(user_id: ID, email: String): User!
    setImage(user_id: ID, imageUrl: String): User!
    deleteUserById(user_id: ID): PostMessageResponse!
    requestReset(email: String): PostMessageResponse!
    resetPassword(
      email: String
      password: String
      confirmPassword: String
      resetToken: String
    ): AuthUser!
  }

  enum UserRoles {
    ADMIN
    AUTHOR
    GUEST
    SUPERADMIN
  }

  input UserInput {
    email: String!
    username: String!
    firstName: String!
    lastName: String!
    password: String!
    role: UserRoles = GUEST
  }

  type User {
    _id: ID!
    email: String
    username: String
    firstName: String
    lastName: String
    role: UserRoles
    image: String
    createdAt: String
    updatedAt: String
  }

  type AuthUser {
    user: User!
    token: String!
  }
`;

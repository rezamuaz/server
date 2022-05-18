import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    getMetadata(id: String): Metadata!
  }

  extend type Mutation {
    createMeta(create: InputMetadata): Metadata
    updateMenu(id: String, updateMenu: [MenuItems]): MenuMessageResponse!
  }

  type MenuMessageResponse {
    message: String!
    success: Boolean
  }

  input MenuItems {
    name: String
    slug: String
  }

  type Menu {
    name: String
    slug: String
  }

  input InputMetadata {
    menu: [MenuItems]
  }
  type Metadata {
    _id: ID
    menu: [Menu]
  }
`;

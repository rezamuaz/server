import {gql} from "apollo-server-express";



export default gql`
    extend type Query {
        hello: String!
    }

    scalar Upload
    type File {
     filename: String!
     mimetype: String!
     encoding: String!
     }




    extend type Mutation {
        imageUploader(file: Upload!): File! 
    }

`
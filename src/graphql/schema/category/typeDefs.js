import { gql } from 'apollo-server-express';

export default gql `

extend type Query{
    allCategory: [Category!]!
    getCategoryById(id: ID): Category!
}

extend type Mutation {
    createCategory(newCategory: CategoryCreate): Category! 
    deleteCategory(id: ID): CategoryMessageResponse! 
    updateCategory(updateCategory: CategoryCreate, id: ID): Category!
}

type CategoryMessageResponse{
    message: String!
    success: Boolean
}

input CategoryCreate{
    name: String!
}

input CategoryInput{
    _id: ID!
    name: String
}
type Category{
    _id: ID!
    name: String!
}
`;

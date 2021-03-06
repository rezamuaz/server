import { gql } from "apollo-server-express";

export default gql`
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  enum PostStatus {
    DRAF
    PUBLISH
    PENDING
  }

  extend type Query {
    allPost: [Post!]!
    getPostByIdOrName(id: ID, title: String, slug: String): Post
    getPostsWithPagination(
      page: Int
      limit: Int
      status: PostStatus
    ): PostPaginator!
    getUserPostsWithPagination(
      page: Int
      limit: Int
      user_id: ID
    ): PostPaginator!
    getPostByCategory(
      page: Int
      limit: Int
      category_id: ID
      category_name: String
    ): PostPaginator!
    getPostByTags(page: Int, limit: Int, tags: String): PostPaginator!
    searchPosts(search: String): PostPaginator!
  }

  extend type Mutation {
    createPost(newPost: PostInput): Post!
    deletePost(id: ID): PostMessageResponse!
    updatePost(update: PostInput, id: ID): Post!
    updateStatus(id: ID, setStatus: PostStatus): Post!
  }

  input ImageInput {
    url: String
    title: String
    caption: String
  }

  type Image {
    url: String
    title: String
    caption: String
  }

  input TagsInput {
    label: String
    value: String
  }

  type Tags {
    label: String
    value: String
  }

  input PostInput {
    title: String!
    slug: String
    image: ImageInput
    category: [CategoryInput]
    tags: [TagsInput]
    content: String!
    status: PostStatus
    show: Boolean!
    description: String
    releaseAt: String
  }

  type PostMessageResponse {
    message: String!
    success: Boolean
  }

  type PostPaginator {
    posts: [Post!]!
    paginator: Paginator!
  }

  type Paginator {
    slNo: Int
    prev: Int
    next: Int
    perPage: Int
    totalPosts: Int
    totalPages: Int
    currentPage: Int
    hasPrevPage: Boolean
    hasNextPage: Boolean
  }

  # setting cache 60s

  type Post @cacheControl(maxAge: 60) {
    _id: ID!
    author: User
    title: String!
    slug: String
    image: Image
    category: [Category]
    tags: [Tags]
    content: String!
    status: PostStatus
    show: Boolean!
    description: String
    releaseAt: String!
    createdAt: String!
    updatedAt: String!
  }
`;

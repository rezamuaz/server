import { NewPostRules } from "../../../validations/index";

import { ApolloError } from "apollo-server-express";
import mongoose from "mongoose";
import { response } from "express";
const {
  isAuthenticated,
  isAdminOrAuthor,
} = require("../../../middlewares/permission");

const PostLabels = {
  docs: "posts",
  limit: "perPage",
  nextPage: "next",
  prevPage: "prev",
  meta: "paginator",
  page: "currentPage",
  pagingCounter: "slNo",
  totalDocs: "totalPosts",
  totalPages: "totalPages",
};

export default {
  Query: {
    /**
     * @DESC to Get all the Posts
     * @Access Public
     */
    allPost: async (_, {}, { Post }) => {
      let posts = await Post.find().populate([
        { path: "author", select: "firstName lastName" },
        { path: "category" },
      ]);
      return posts;
    },
    /**
     * @DESC to Get single the Post by ID
     * @Access Public
     */
    getPostByIdOrName: async (_, { id, title, slug }, { Post }) => {
      try {
        let post = await Post.findOne({
          $or: [{ _id: id }, { title: title }, { slug: slug }],
        }).populate([
          { path: "author", select: "firstName lastName" },
          { path: "category" },
        ]);
        return post;
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
    /**
     * @DESC to Get Posts by Pagination variables
     * @Access Public
     * user, isAuth come from context.req, index.js
     */
    getPostsWithPagination: async (_, { page, limit, status }, { Post }) => {
      const options = {
        page: page || 1,
        limit: limit || 10,
        customLabels: PostLabels,
        sort: {
          createdAt: -1,
        },
        populate: [{ path: "author", select: "firstName lastName" }],
      };
      let query = { status: status };
      let posts = await Post.paginate(query, options);
      return posts;
    },
    /**
     * @DESC to Get Posts by Pagination variables
     * @Access Public
     */
    getUserPostsWithPagination: async (
      _,
      { page, limit, user_id },
      { Post }
    ) => {
      const options = {
        page: page || 1,
        limit: limit || 10,
        customLabels: PostLabels,
        sort: {
          createdAt: -1,
        },
        populate: [
          { path: "author", select: "firstName lastName" },
          { path: "category" },
        ],
      };

      let query = {};
      if (user_id) {
        query = {
          author: user_id,
        };
      }

      let posts = await Post.paginate(query, options);
      return posts;
    },

    /**
     * @DESC to Get Posts by Category ID with Pagination variables
     * @Access Public
     * user, isAuth come from context.req, index.js
     */

    getPostByCategory: async (
      _,
      { page, limit, category_id, category_name },
      { Post }
    ) => {
      const options = {
        page: page || 1,
        limit: limit || 10,
        customLabels: PostLabels,
        sort: {
          createdAt: -1,
        },
        populate: [
          { path: "author", select: "firstName lastName" },
          { path: "category", select: "_id name" },
        ],
      };
      let query = {
        category: {
          $elemMatch: { $or: [{ _id: category_id }, { name: category_name }] },
        },
      };

      let posts = await Post.paginate(query, options);
      return posts;
    },

    getPostByTags: async (_, { page, limit, tags }, { Post }) => {
      const options = {
        page: page || 1,
        limit: limit || 10,
        customLabels: PostLabels,
        sort: {
          createdAt: -1,
        },
        populate: [{ path: "author", select: "firstName lastName" }],
      };
      let query = { tags: { $elemMatch: { value: tags } } };
      let posts = await Post.paginate(query, options);
      return posts;
    },

    searchPosts: async (_, { page, limit, search }, { Post }) => {
      var word = new RegExp(search, "i");
      const options = {
        page: page || 1,
        limit: limit || 10,
        customLabels: PostLabels,
        sort: {
          createdAt: -1,
        },
      };
      let query = {
        $or: [
          {
            title: { $regex: word },
          },
          { description: { $regex: word } },
          { tags: { $elemMatch: { value: { $regex: word } } } },
        ],
      };
      let posts = await Post.paginate(query, options);
      return posts;
    },
  },
  Mutation: {
    /**
     * @DESC to Create new Post
     * @Access Private
     */
    createPost: async (_, { newPost }, { Post, isAuth, user }) => {
      isAuthenticated(isAuth);
      isAdminOrAuthor(user);
      try {
        let {
          title,
          slug,
          content,
          image,
          category,
          tags,
          show,
          description,
          status,
        } = newPost;

        // Validate the incoming new Post arguments
        await NewPostRules.validate(
          {
            title,
            content,
            description,
          },
          {
            abortEarly: false,
          }
        );
        // Check if dulicate post with same title
        let findPost = await Post.findOne({ title: title });
        if (findPost !== null) {
          throw new Error("There is 1 Post with same title!");
        }
        // Once the Validations are passed Create New Post
        const post = new Post({ ...newPost, author: user.id });

        // Save the post
        let result = await post.save();
        return await Post.findById(result.id.toString()).populate([
          { path: "author", select: "firstName lastName" },
        ]);
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
    /**
     * @DESC to Update an Existing Post by ID
     * @Access Private
     */
    updatePost: async (_, { update, id }, { Post, isAuth, user }) => {
      isAuthenticated(isAuth);
      isAdminOrAuthor(user);
      try {
        let {
          title,
          slug,
          content,
          image,
          category,
          tags,
          show,
          description,
          status,
        } = update;
        await NewPostRules.validate({
          title,
          slug,
          content,
          status,
          tags,
          category,
          description,
          show,
        });
        let findPost = await Post.findOne({
          _id: id,
        });

        if (user.role !== "ADMIN" && findPost.author.toString() !== user.id) {
          throw new Error("Not Author");
        }
        const post = Post({
          ...findPost._doc,
          title: title,
          image: image,
          category: category,
          tags: tags,
          content: content,
          status: status,
          show: show,
          description: description,
          updateAt: new Date(),
        });
        await Post.updateOne(
          {
            _id: id,
          },
          post
        );
        let getBack = await Post.findById(id).populate([
          { path: "author", select: "firstName lastName" },
        ]);

        return getBack();
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
    /**
     * @DESC to Delete an Existing Post by ID
     * @Params id!
     * @Access Private
     */
    deletePost: async (_, { id }, { Post, user, isAuth }) => {
      isAuthenticated(isAuth);
      isAdminOrAuthor(user);
      try {
        let post = await Post.findOne({
          _id: id,
        });
        //  Validate Only ADMIN and author post

        if (user.role === "ADMIN" || post.author.toString() === user.id) {
          await Post.deleteOne({ _id: post._id.toString() });
          return {
            success: true,
            message: "Post Deleted Successfully.",
          };
        }
        throw new Error("You are not ADMIN or author of this post");
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
    updateStatus: async (_, { id, setStatus }, { Post, isAuth, user }) => {
      try {
        isAuthenticated(isAuth);
        isAdminOrAuthor(user);
        let status = { status: setStatus };
        let postToFind = await Post.findByIdAndUpdate(id, status, {
          new: true,
        });

        if (!user) {
          throw new Error("Unathorized Access");
        }
        return postToFind;
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
  },
};

import { ApolloError } from 'apollo-server-express';
import { NewCategoryRules } from '../../../validations/index';
const { isAuthenticated, isAdminOrAuthor } = require('../../../middlewares/permission');

export default {
	Query: {
		/**
         * @DESC Get All Categories 
         * @Access Public
         */
		allCategory: async (_, {}, { Category }) => {
			let categories = await Category.find();
			return categories;
		},

		/**
         * @DESC to Get single the Category by ID
         * @Access Public
         */
		getCategoryById: async (_, { id }, { Category }) => {
			let category = await Category.findById(id);
			return category;
		}
	},

	Mutation: {
		/**
         * @DESC to Create new Category
         * @Params newCategory{ 
                name!
            }
         * @Access Private
         */

		createCategory: async (_, { newCategory }, { Category, isAuth, user }) => {
			isAuthenticated(isAuth);
			isAdminOrAuthor(user);
			try {
				const { name } = newCategory;

				// Validate the incoming new Post arguments

				await NewCategoryRules.validate(
					{
						name
					},
					{
						abortEarly: false
					}
				);
				// Check duplicate category with name
				let findCategory = await Category.findOne({name: name})
				if (findCategory !== null){
					throw new Error ('There is 1 Category with same name!')
				}
				// Once the Validations are passed Create New Category
				let category = new Category({ ...newCategory });

				// Save the post
				let result = await category.save();
				result = {
					...result.toObject(),
					id: result._id.toString()
				};
				return result;
			} catch (err) {
				throw new ApolloError(err.message);
			}
		},

		/**
         * @DESC to Delete an Existing Category by ID
         * @Params id!
         * @Access Private
         */
		deleteCategory: async (_, { id }, { Category, isAuth, user }) => {
			isAuthenticated(isAuth);
			isAdminOrAuthor(user);
			try {
				let category = await Category.findOneAndDelete({
					_id: id
				});

				if (!category) {
					throw new Error('Unathorized Access');
				}
				return {
					success: true,
					message: 'Category Deleted Successfully.'
				};
			} catch (err) {
				throw new ApolloError(err.message);
			}
		}
	}
};

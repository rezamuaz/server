import { ApolloError } from "apollo-server-express";
import { NewCategoryRules } from "../../../validations/index";
const {
  isAuthenticated,
  isSuperAdmin,
} = require("../../../middlewares/permission");

export default {
  Query: {
    /**
     * @Access Private
     */
    getMetadata: async (_, { id }, { Metadata }) => {
      let metadata = await Metadata.findById(id);
      return metadata;
    },
  },

  Mutation: {
    /**
     * @DESC to Create new menu
     * @Access Private
     */

    createMeta: async (_, { create }, { Metadata, isAuth, user }) => {
      isAuthenticated(isAuth);
      isSuperAdmin(user);
      try {
        let meta = new Metadata({ ...create });
        // Save the post
        let result = await meta.save();
        result = {
          ...result.toObject(),
          id: result._id.toString(),
        };
        return result;
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },

    /**
     * @DESC to Update an Existing Menu by ID
     * @Params id!
     * @Access Private
     */
    updateMenu: async (_, { id, updateMenu }, { Metadata, isAuth, user }) => {
      isAuthenticated(isAuth);
      isSuperAdmin(user);
      try {
        let menu = await Metadata.findByIdAndUpdate(id, { menu: updateMenu });

        if (!menu) {
          throw new Error("Unathorized Access");
        }
        return {
          success: true,
          message: "Menu Updated Successfully.",
        };
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
  },
};

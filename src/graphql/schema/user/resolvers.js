import { hash, compare } from "bcryptjs";
import { ApolloError } from "apollo-server-express";
const crypto = require("crypto");
import { serializeUser, issueAuthToken } from "../../../helpers/Userfunctions";
import {
  UserRegisterationRules,
  UserAuthenticationRules,
} from "../../../validations/index";
import {
  isAuthenticated,
  isAdmin,
  isAdminOrAuthor,
  isSuperAdmin,
} from "../../../middlewares/permission";
import sendEmailReset from "../../utils/sendmail";

export default {
  // Standard User Query Property
  Query: {
    /**
     * @DESC to authenticate using parameters
     * @Params { username, password }
     * @Access Public
     */
    loginUser: async (_, { email, password }, { User }) => {
      // Validate Incoming User Credentials
      await UserAuthenticationRules.validate(
        { email, password },
        { abortEarly: false }
      );
      // Find the user from the database
      let user = await User.findOne({
        email,
      });
      // If User is not found
      if (!user) {
        throw new ApolloError("Username not found", "404");
      }
      // If user is found then compare the password
      let isMatch = await compare(password, user.password);
      // If Password don't match
      if (!isMatch) {
        throw new ApolloError("Password not match", "403");
      }
      let genToken = serializeUser(user);
      // Issue Token
      let token = await issueAuthToken(genToken);
      return {
        user,
        token,
      };
    },
    /**
     * @DESC Get the authenticated User
     * @Headers Authorization
     * @Access Private ADMIN ONLY
     */

    getAllUser: async (_, {}, { User, isAuth, user }) => {
      try {
        // check authenticated user
        isAuthenticated(isAuth);
        //check only admin allow
        isAdmin(user);
        let users = await User.find();
        return users;
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
    /**
     * @DESC Get the authenticated User by Id
     * @Headers Authorization
     * @Access Private ADMIN ONLY
     */
    getUserById: async (_, { user_id }, { User, isAuth, user }) => {
      try {
        // check authenticated user
        isAuthenticated(isAuth);
        //check only admin allow
        isAdmin(user);
        let userFind = await User.findById(user_id);
        return userFind;
      } catch (err) {
        throw ApolloError(err.message);
      }
    },
    /**
     * @DESC Get the authenticated User
     * @Headers Authorization
     * @Access Private
     */
    authUser: (_, {}, { req: { user, isAuth } }) => {
      isAuthenticated(isAuth);
      return user;
    },
  },

  // Standarad User Mutation Property
  Mutation: {
    /**
     * @DESC Register new user
     * @Params newUser{ username, firstName, lastName, email, password }
     * @Access Public
     */
    registerUser: async (_, { newUser }, { User }) => {
      try {
        let { email, username, firstName, lastName, role } = newUser;

        // Validate Incoming New User Arguments
        await UserRegisterationRules.validate(newUser, { abortEarly: false });

        // Check if the Username is taken
        let user = await User.findOne({
          username,
        });
        if (user) {
          throw new ApolloError("Username is already taken.", "403");
        }

        // Check is the Email address is already registred
        user = await User.findOne({
          email,
        });
        if (user) {
          throw new ApolloError("Email is already registred.", "403");
        }

        // New User's Account can be created
        user = new User(newUser);

        // Hash the user password
        user.password = await hash(user.password, 10);

        // Save the user to the database
        let result = await user.save();
        result = serializeUser(result);
        // Issue Token
        let token = await issueAuthToken(result);
        return {
          token,
          user: result,
        };
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
    /**
     * @DESC Update user firstName and lastName
     * @Access Private
     */
    changeUserData: async (
      _,
      { user_id, firstName, lastName },
      { User, isAuth }
    ) => {
      isAuthenticated(isAuth);
      // check use exist
      const user = await User.findOne({ _id: user_id });

      if (!user) throw new ApolloError("No user foundl", "404");
      //find user and update data
      const result = await User.findOneAndUpdate(
        { _id: user_id },
        { firstName: firstName, lastName: lastName },
        { new: true }
      );
      return result;
    },
    /**
     * @DESC Update user email
     * @Access Private
     */
    changeUserEmail: async (_, { user_id, email }, { User, isAuth }) => {
      isAuthenticated(isAuth);
      const user = await User.findOne({ _id: user_id });

      if (!user) throw new ApolloError("No user foundl", "404");

      const usermail = await User.findOne({
        email,
      });
      if (usermail) {
        throw new ApolloError("Email is already registred.", "403");
      }

      const result = await User.findOneAndUpdate(
        { _id: user_id },
        { email: email },
        { new: true }
      );
      return result;
    },

    /**
     * @DESC Request Token ResetPassword
     * @Access Private
     */
    requestReset: async (_, { email }, { User }) => {
      email = email.toLowerCase();

      // Check that user exist
      const user = await User.findOne({ email: email });

      if (!user) throw new ApolloError("No user found with that email", "404");

      // Create randomBytes that will be used as a token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
      // Add token and tokenExpiry to the db user
      const result = await User.findOneAndUpdate(
        { email: email },
        { resetToken: resetToken, resetTokenExpiry: resetTokenExpiry },
        { upsert: true }
      );
      let mail = await sendEmailReset(email, resetToken);
      return mail;
    },
    /**
     * @DESC Reset Password by ExpiryToken
     * @Access Private
     */
    resetPassword: async (
      _,
      { email, password, confirmPassword, resetToken },
      { User }
    ) => {
      email = email.toLowerCase();
      // check if passwords match
      if (password !== confirmPassword) {
        throw new Error(`Your passwords don't match`);
      }
      // find the user with that resetToken
      // make sure it's not expired
      const user = await User.findOne({
        resetToken: resetToken,
        resetTokenExpiry: {
          $gte: Date.now() - 3600000,
        },
      });
      // throw error if user doesn't exist
      if (!user)
        throw new Error("Your reset token is either invalid or expired.");

      const saltRounds = 10;
      const encryptpw = await hash(password, saltRounds);
      const result = await User.findOneAndUpdate(
        { _id: user._id },
        {
          password: encryptpw,
          resetToken: null,
          resetTokenExpiry: null,
        },
        {
          new: true,
        }
      );
      // serializer token
      let genToken = serializeUser(user);
      // Issue Token
      let token = await issueAuthToken(genToken);
      return {
        user,
        token,
      };
    },
    /**
     * @DESC Change user role
     * @Params newUser{ user_id, setRole}
     * @Access Private ADMIN ONLY
     */
    setUserRoleById: async (
      _,
      { user_id, setRole },
      { User, isAuth, user }
    ) => {
      try {
        isAuthenticated(isAuth);
        isSuperAdmin(user);
        if (user._id.toString() === user_id) {
          throw new Error("Not allow to change your own role", "404");
        }
        let role = { role: setRole };
        // find user by id and update new role
        let userToFind = await User.findByIdAndUpdate(user_id, role, {
          new: true,
        });
        // check if user exist
        if (!user) {
          throw new Error("Unathorized Access", "404");
        }
        return userToFind;
      } catch (error) {
        throw new ApolloError(error.message);
      }
    },
    /**
     * @DESC Add avatar
     * @Params newUser{ user_id, imageUrl}
     * @Access Private
     */
    setImage: async (_, { user_id, imageUrl }, { User, isAuth, user }) => {
      try {
        isAuthenticated(isAuth);
        isAdmin(user);
        let image = { image: imageUrl };
        // find user by id and update new avatar
        let userToFind = await User.findByIdAndUpdate(user_id, image, {
          new: true,
        });
        // check if user exist
        if (!user) {
          throw new Error("Unathorized Access", "404");
        }
        return userToFind;
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
    /**
     * @DESC Delete user by id
     * @Params newUser{ user_id}
     * @Access Private ADMIN ONLY
     */
    deleteUserById: async (_, { user_id }, { User, isAuth, user, Post }) => {
      try {
        isAuthenticated(isAuth);
        isSuperAdmin(user);
        if (user._id.toString() === user_id) {
          throw new ApolloError("Not allow to delete your self account", "404");
        }
        let post = await Post.paginate({
          author: user_id,
        });
        if (post.totalDocs !== 0) {
          throw new ApolloError("there is post linked to the author");
        }
        // find user by id and delete user
        let userDelete = await User.findByIdAndDelete(user_id);
        // check if user exist
        if (!user) {
          throw new ApolloError("user not found", "404");
        }
        // throw message if deleted successfully
        return {
          success: true,
          message: "User Deleted Successfully.",
        };
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
  },
};

import { ApolloError } from "apollo-server-express";

export const isAuthenticated = (isAuth) => {
  if (!isAuth) {
    throw new ApolloError("You need to be login");
  }
};

export const isSuperAdmin = (user) => {
  if (user.role !== "SUPERADMIN") {
    throw new ApolloError("You need to be SUPER ADMIN");
  }
};

export const isAdmin = (user) => {
  if (!(user.role === "ADMIN" || user.role === "SUPERADMIN")) {
    throw new ApolloError("You need to be ADMIN");
  }
};

export const isAuthor = (user) => {
  if (user.role !== "AUTHOR") {
    throw new ApolloError("You need to be AUTHOR");
  }
};

export const isAdminOrAuthor = (user) => {
  if (
    !(
      user.role === "ADMIN" ||
      user.role === "AUTHOR" ||
      user.role === "SUPERADMIN"
    )
  ) {
    throw new ApolloError("You need to be ADMIN or AUTHOR");
  }
};

exports.isAuthenticated = isAuthenticated;
exports.isAdmin = isAdmin;
exports.isAuthor = isAuthor;
exports.isAdminOrAuthor = isAdminOrAuthor;

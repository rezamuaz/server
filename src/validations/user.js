import * as yup from "yup";

/**
 * USER MODEL Validation Rules
 */

const username = yup
  .string()
  .required("Username is required.")
  .min(5, "Username should have atleast 5 characters.")
  .max(20, "Username should have atmost 10 characters.")
  .matches(/^\w+$/, "Should be alphanumeric.")
  .lowercase("Username must be lowercase");

const firstName = yup
  .string()
  .required("First Name is required.")
  .min(3, "First name should have atleast 3 characters.");

const lastName = yup
  .string()
  .required("Last name is required.")
  .min(3, "Last name should have atleast 3 characters.");
const email = yup
  .string()
  .email("This is invalid email.")
  .required("Email is required.");

const role = yup
  .string()
  .required("role is required.")
  .matches("GUEST", "This is invalid role, role must be set to GUEST.");

const password = yup
  .string()
  .required("Password is required.")
  .min(5, "Password should have atleast 5 characters.")
  .max(25, "Password should have atmost 25 characters.");

// User Registeration Validation Schema
export const UserRegisterationRules = yup.object().shape({
  username,
  password,
  firstName,
  lastName,
  email,
  role,
});

// User Authentication Validation Schema
export const UserAuthenticationRules = yup.object().shape({
  email,
  password,
});

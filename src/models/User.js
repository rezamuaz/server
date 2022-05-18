import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    resetToken: {
      type: String,
      require: true,
    },
    resetTokenExpiry: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("users", UserSchema);

export default User;

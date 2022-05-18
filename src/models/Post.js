import { Schema, model } from "mongoose";
import Paginate from "mongoose-paginate-v2";

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    image: {
      type: Object,
      required: true,
    },
    category: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "categories" },
        name: { type: String, ref: "categories" },
      },
    ],
    tags: [
      {
        type: Object,
        required: true,
      },
    ],
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    releaseAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.plugin(Paginate);
const Post = model("posts", PostSchema);

export default Post;

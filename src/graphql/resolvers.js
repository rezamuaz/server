import post from "./schema/post/resolvers";
import user from "./schema/user/resolvers";
import category from "./schema/category/resolvers";
// import image from './schema/image/resolvers'
import metadata from "./schema/metadata/resolvers";

const resolvers = [
  post,
  user,
  category,
  // image,
  metadata,
];
export default resolvers;

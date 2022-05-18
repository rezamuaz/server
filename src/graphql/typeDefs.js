import baseDefs from "./schema/baseDefs";
import post from "./schema/post/typeDefs";
import user from "./schema/user/typeDefs";
import category from "./schema/category/typeDefs";
import image from "./schema/image/typeDefs";
import metadata from "./schema/metadata/typeDefs";

const typeDefs = [post, user, baseDefs, category, image, metadata];

export default typeDefs;

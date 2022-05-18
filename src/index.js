import express from "express";

import { join } from "path";
import { ApolloServer } from "apollo-server-express";
// const  schemaDirectives = require ('./graphql/schema/directives');
import { error, success } from "consola";
import { DB, PORT, IN_PROD } from "./config";
import * as AppModels from "./models";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import AuthMiddleware from "./middlewares/auth";
import {
  ApolloServerPluginLandingPageProductionDefault,
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import mongoose from "mongoose";
const cors = require("cors");
const { graphqlUploadExpress } = require("graphql-upload");

const app = express();
// Remove x-powered-by header
app.disable("x-powered-by");
var whitelist = ["http://localhost:3000"];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};
app.use(cors());
app.use(express.static(join(__dirname, "./uploads")));
app.use(graphqlUploadExpress());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });
app.use(AuthMiddleware);

const server = new ApolloServer({
  cors: true,
  typeDefs,
  resolvers,
  plugins: [
    process.env.NODE_ENV === "production"
      ? ApolloServerPluginLandingPageProductionDefault({
          graphRef: "my-graph-id@my-graph-variant",

          footer: false,
        })
      : ApolloServerPluginLandingPageLocalDefault(),
  ],
  playground: !IN_PROD,
  context: ({ req }) => {
    let { user, isAuth } = req;
    return {
      req,
      user,
      isAuth,
      ...AppModels,
    };
  },
});
// Function to start express and apollo server
const startApp = async () => {
  try {
    // Connect With MongoDB Database
    mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    success({
      badge: true,
      message: `Successfully connected with the database ${DB}`,
    });
    await server.start();
    // Apply Apollo-Express-Server Middlware to express application
    server.applyMiddleware({
      cors: true,
      app,
    });
    // Start Listening on the Server
    app.listen(PORT, () =>
      success({
        badge: true,
        message: `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`,
      })
    );
  } catch (err) {
    error({
      badge: true,
      message: err.message,
    });
  }
};

// Invoke Start Application Function
startApp();

// DB=mongodb://127.0.0.1:27017/server

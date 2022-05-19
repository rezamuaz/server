import { config } from "dotenv";

const { parsed } = config();

export const {
  PORT,
  DBPROD,
  DBDEV,
  NODE_ENV,
  SECRET,
  HOST,
  EMAIL_SERVICE,
  EMAIL_DOMAIN,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  WEBNAME,
  FRONTEND_HOST,
} = parsed;
export const DB = NODE_ENV === "production" ? DBPROD : DBDEV;

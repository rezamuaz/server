import { config } from "dotenv";

const { parsed } = config();

export const {
  DB,
  PORT,
  PROD,
  SECRET,
  IN_PROD = PROD === "prod",
  BASE_URL = `127.0.0.1:${PORT}`,
} = parsed;

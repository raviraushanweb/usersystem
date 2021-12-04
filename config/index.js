import dotenv from "dotenv";
dotenv.config();

export const {
  DB_URL,
  APP_PORT,
  APP_URL,
  DEBUG_MODE,
  JWT_SECRET,
  REFRESH_SECRET,
} = process.env;

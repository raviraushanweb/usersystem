import dotenv from "dotenv";
dotenv.config();

export const {
  DB_URL,
  APP_PORT,
  APP_URL,
  DEBUG_MODE,
  JWT_SECRET,
  REFRESH_SECRET,
  APP_NAME,
  EMAIL_SECRET,
  EMAIL_HOST,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  SMTP_PORT,
} = process.env;

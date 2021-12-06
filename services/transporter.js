import {
  EMAIL_HOST,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  SMTP_PORT,
} from "../config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

export default transporter;

import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",

  DATABASE_URL: process.env.DATABASE_URL!,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

  NODE_ENV: process.env.NODE_ENV || "development",

  BREVO_API_KEY:process.env.BREVO_API_KEY,

  MAIL_FROM:process.env.MAIL_FROM,

  REDIS_URL: process.env.REDIS_URL ?? "",
};
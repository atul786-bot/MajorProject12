import dotenv from "dotenv";
dotenv.config();

export const config = {
  healeniumUrl: process.env.HEALENIUM_URL || "http://localhost:8085",
  browser: process.env.SELENIUM_BROWSER || "chrome",
  headless: process.env.HEADLESS === "true",
  defaultTimeout: 10000,
  healeniumDb: {
    host: process.env.HEALENIUM_DB_HOST || "localhost",
    port: Number(process.env.HEALENIUM_DB_PORT || 5432),
    user: process.env.HEALENIUM_DB_USER || "healenium_user",
    password: process.env.HEALENIUM_DB_PASSWORD || "",
    database: process.env.HEALENIUM_DB_NAME || "healenium"
  }
};

export default config;

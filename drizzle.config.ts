import { defineConfig } from "drizzle-kit";

const isProd = process.env.DATABASE_URL?.startsWith("libsql://");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: isProd ? "turso" : "sqlite",
  dbCredentials: isProd
    ? {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }
    : {
        url: process.env.DATABASE_URL || "file:local.db",
      },
});

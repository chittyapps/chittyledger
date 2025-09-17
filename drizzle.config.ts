import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
  },
  verbose: true,
  strict: true,
  migrations: {
    prefix: "timestamp",
  },
});

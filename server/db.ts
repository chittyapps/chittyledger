import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Initialize database connection
let sql: ReturnType<typeof neon> | null = null;
let db: any = null;

export function initializeDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      sql = neon(process.env.DATABASE_URL);
      db = drizzle(sql, { schema });
      console.log("✅ PostgreSQL database connected");
      return db;
    } catch (error) {
      console.error("❌ Failed to connect to PostgreSQL:", error);
      console.log("📝 Falling back to in-memory storage");
      return null;
    }
  } else {
    console.log("⚠️  No DATABASE_URL found, using in-memory storage");
    return null;
  }
}

export function getDatabase() {
  return db;
}

export function isPostgreSQLEnabled() {
  return db !== null;
}
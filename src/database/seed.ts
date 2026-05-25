/**
 * Database Seed Script
 * Run: npm run db:seed
 * 
 * This seeds the MariaDB database with the HR admin account and default holidays.
 * HR Credentials: username: codeorigin, password: hrcodeoriginai@1234
 * 
 * Make sure your .env file has the correct DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env file
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function seed() {
  console.log("Connecting to MariaDB...");
  console.log(`  Host: ${process.env.DB_HOST || "localhost"}`);
  console.log(`  Port: ${process.env.DB_PORT || "3306"}`);
  console.log(`  Database: ${process.env.DB_NAME || "hr_management"}`);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  try {
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "hr_management"}`);
    await connection.query(`USE ${process.env.DB_NAME || "hr_management"}`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log("\nCreating tables...");
    for (const stmt of statements) {
      try {
        await connection.query(stmt);
      } catch (err: unknown) {
        const e = err as { code?: string; message?: string };
        // Ignore "already exists" errors
        if (e.code !== "ER_TABLE_EXISTS_ERROR") {
          console.warn(`  Warning: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // Seed HR Admin with fresh password hash
    console.log("\nSeeding HR Admin...");
    const hashedPassword = await bcrypt.hash("hrcodeoriginai@1234", 12);
    await connection.query(
      `INSERT INTO hr_admin (username, password) VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE password = ?`,
      ["codeorigin", hashedPassword, hashedPassword]
    );

    // Seed holidays
    console.log("Seeding holidays...");
    const holidays = [
      ["New Year's Day", "2025-01-01", "national", "Wednesday"],
      ["Republic Day", "2025-01-26", "national", "Sunday"],
      ["Holi", "2025-03-14", "religious", "Friday"],
      ["Good Friday", "2025-04-18", "religious", "Friday"],
      ["May Day", "2025-05-01", "national", "Thursday"],
      ["Company Foundation Day", "2025-05-15", "company", "Thursday"],
      ["Independence Day", "2025-08-15", "national", "Friday"],
      ["Ganesh Chaturthi", "2025-08-27", "religious", "Wednesday"],
      ["Gandhi Jayanti", "2025-10-02", "national", "Thursday"],
      ["Dussehra", "2025-10-02", "religious", "Thursday"],
      ["Diwali", "2025-10-21", "religious", "Tuesday"],
      ["Diwali (Day 2)", "2025-10-22", "religious", "Wednesday"],
      ["Christmas", "2025-12-25", "religious", "Thursday"],
      ["Year End Break", "2025-12-31", "company", "Wednesday"],
      ["Eid ul-Fitr", "2025-03-31", "optional", "Monday"],
      ["Raksha Bandhan", "2025-08-09", "optional", "Saturday"],
    ];

    for (const [name, date, type, day] of holidays) {
      await connection.query(
        `INSERT INTO holidays (name, date, type, day) 
         SELECT ?, ?, ?, ? FROM DUAL 
         WHERE NOT EXISTS (SELECT 1 FROM holidays WHERE name = ? AND date = ?)`,
        [name, date, type, day, name, date]
      );
    }

    console.log("\n✅ Database seeded successfully!");
    console.log("");
    console.log("HR Admin Credentials:");
    console.log("  Username: codeorigin");
    console.log("  Password: hrcodeoriginai@1234");
    console.log("");
    console.log("Now run: npm run dev");
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

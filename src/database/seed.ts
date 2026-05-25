/**
 * Database Seed Script for MariaDB
 * Run: npm run db:seed
 * 
 * This creates the database, tables, and seeds the HR admin account.
 * HR Credentials: username: codeorigin, password: hrcodeoriginai@1234
 */

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

async function seed() {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306");
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "hr_management";

  console.log(`Connecting to MariaDB at ${host}:${port}...`);

  // First connect without database to create it
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  console.log("Connected! Creating database and tables...");

  // Read and execute schema
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Execute schema statements
  await connection.query(schema);

  // Now connect to the actual database
  await connection.changeUser({ database: dbName });

  // Generate fresh bcrypt hash for HR admin
  console.log("Generating HR admin password hash...");
  const hashedPassword = await bcrypt.hash("hrcodeoriginai@1234", 12);

  // Upsert HR admin
  await connection.execute(
    `INSERT INTO hr_admin (username, password) VALUES (?, ?) 
     ON DUPLICATE KEY UPDATE password = ?`,
    ["codeorigin", hashedPassword, hashedPassword]
  );

  console.log("");
  console.log("✅ Database seeded successfully!");
  console.log(`📁 Database: ${dbName} on ${host}:${port}`);
  console.log("");
  console.log("HR Admin Credentials:");
  console.log("  Username: codeorigin");
  console.log("  Password: hrcodeoriginai@1234");
  console.log("");
  console.log("Now run: npm run dev");

  await connection.end();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

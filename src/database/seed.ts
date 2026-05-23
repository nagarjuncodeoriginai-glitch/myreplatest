/**
 * Database Seed Script
 * Run: npm run db:seed
 * 
 * This creates a data.json file with the HR admin account.
 * HR Credentials: username: codeorigin, password: hrcodeoriginai@1234
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

async function seed() {
  const DATA_FILE = path.join(process.cwd(), "data.json");

  console.log("Generating HR admin password hash...");
  const hashedPassword = await bcrypt.hash("hrcodeoriginai@1234", 12);

  const data = {
    hr_admin: [
      {
        id: 1,
        username: "codeorigin",
        password: hashedPassword,
      },
    ],
    employees: [],
    leaves: [],
    leave_balance: [],
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  console.log("✅ Database seeded successfully!");
  console.log("📁 Data file created at:", DATA_FILE);
  console.log("");
  console.log("HR Admin Credentials:");
  console.log("  Username: codeorigin");
  console.log("  Password: hrcodeoriginai@1234");
  console.log("");
  console.log("Now run: npm run dev");
}

seed().catch(console.error);

/**
 * JSON File-Based Storage
 * No database required! Data is stored in a local JSON file.
 * This works immediately without any setup.
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DATA_FILE = path.join(process.cwd(), "data.json");

export interface DBData {
  hr_admin: {
    id: number;
    username: string;
    password: string;
  }[];
  employees: {
    id: number;
    emp_id: string;
    full_name: string;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    address: string;
    department: string;
    designation: string;
    manager_name: string;
    doj: string;
    employment_type: string;
    probation_period: string;
    confirmation_date: string;
    work_location: string;
    shift_timing: string;
    salary_package: string;
    bank_account_number: string;
    ifsc_code: string;
    pan_number: string;
    aadhaar_number: string;
    username: string;
    password: string;
    profile_photo: string;
    status: "active" | "inactive" | "on_probation";
    created_at: string;
    updated_at: string;
  }[];
  leaves: {
    id: number;
    employee_id: number;
    leave_type: "CL";
    start_date: string;
    end_date: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    applied_at: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
  }[];
  leave_balance: {
    id: number;
    employee_id: number;
    month: number;
    year: number;
    total_cl: number;
    used_cl: number;
    remaining_cl: number;
  }[];
}

// HR Admin password: hrcodeoriginai@1234 (pre-hashed)
const DEFAULT_DATA: DBData = {
  hr_admin: [
    {
      id: 1,
      username: "codeorigin",
      password: "$2a$12$LQv3c1yqBo9SkvXS7QTJPOoGz2EzfLzG0M8LcHqOqK5F5GqHu5Vqa",
    },
  ],
  employees: [],
  leaves: [],
  leave_balance: [],
};

function initializeData(): DBData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // If file is corrupted, recreate it
  }

  // Generate fresh hash for HR admin password
  const hashedPassword = bcrypt.hashSync("hrcodeoriginai@1234", 12);
  DEFAULT_DATA.hr_admin[0].password = hashedPassword;

  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  return DEFAULT_DATA;
}

export function getData(): DBData {
  return initializeData();
}

export function saveData(data: DBData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getNextId(items: { id: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}

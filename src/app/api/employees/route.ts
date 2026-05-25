import { NextRequest, NextResponse } from "next/server";
import { query, insert, queryOne } from "@/database/connection";
import { requireAuth, hashPassword } from "@/lib/auth";
import { employeeSchema } from "@/lib/validations";

// GET all employees (HR only)
export async function GET(request: NextRequest) {
  try {
    await requireAuth("hr");

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let params: (string | number | boolean | null | undefined)[] = [];

    if (search) {
      whereClauses.push("(full_name LIKE ? OR emp_id LIKE ? OR email LIKE ? OR department LIKE ?)");
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (department) {
      whereClauses.push("department = ?");
      params.push(department);
    }

    if (status) {
      whereClauses.push("status = ?");
      params.push(status);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Get total count
    const countResult = await query<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM employees ${whereStr}`,
      params
    );
    const total = countResult[0].total;

    // Get paginated results (exclude password)
    const employees = await query(
      `SELECT id, emp_id, full_name, email, phone, gender, date_of_birth, address, 
              department, designation, manager_name, doj, employment_type, probation_period, 
              confirmation_date, work_location, shift_timing, salary_package, bank_account_number, 
              ifsc_code, pan_number, aadhaar_number, username, profile_photo, status, 
              created_at, updated_at 
       FROM employees ${whereStr} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Get employees error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// Helper: convert empty string to null for DATE columns
function toDateOrNull(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") return null;
  return value;
}

// POST create new employee (HR only)
export async function POST(request: NextRequest) {
  try {
    await requireAuth("hr");

    const body = await request.json();
    const validation = employeeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for duplicates
    const existingEmpId = await queryOne("SELECT id FROM employees WHERE emp_id = ?", [data.emp_id]);
    if (existingEmpId) {
      return NextResponse.json({ success: false, message: "Employee ID already exists" }, { status: 409 });
    }

    const existingEmail = await queryOne("SELECT id FROM employees WHERE email = ?", [data.email]);
    if (existingEmail) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
    }

    const existingUsername = await queryOne("SELECT id FROM employees WHERE username = ?", [data.username]);
    if (existingUsername) {
      return NextResponse.json({ success: false, message: "Username already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(data.password);

    const newId = await insert(
      `INSERT INTO employees (emp_id, full_name, email, phone, gender, date_of_birth, address, 
        department, designation, manager_name, doj, employment_type, probation_period, 
        confirmation_date, work_location, shift_timing, salary_package, bank_account_number, 
        ifsc_code, pan_number, aadhaar_number, username, password, profile_photo, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.emp_id,
        data.full_name,
        data.email,
        data.phone,
        data.gender,
        toDateOrNull(data.date_of_birth),
        data.address || "",
        data.department,
        data.designation,
        data.manager_name || "",
        data.doj,
        data.employment_type,
        data.probation_period || "",
        toDateOrNull(data.confirmation_date),
        data.work_location || "",
        data.shift_timing || "",
        data.salary_package || "",
        data.bank_account_number || "",
        data.ifsc_code || "",
        data.pan_number || "",
        data.aadhaar_number || "",
        data.username,
        hashedPassword,
        (body.profile_photo as string) || "",
        data.status || "active",
      ]
    );

    // Create initial leave balance for current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    await insert(
      `INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) 
       VALUES (?, ?, ?, 2, 0, 2)`,
      [newId, currentMonth, currentYear]
    );

    return NextResponse.json(
      { success: true, message: "Employee created successfully", id: newId },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Create employee error:", error);
    return NextResponse.json({ success: false, message: "Database error: " + (error as Error).message }, { status: 500 });
  }
}

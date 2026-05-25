import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute } from "@/database/connection";
import { requireAuth, hashPassword } from "@/lib/auth";

// GET single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    let employee;

    if (user.role === "hr") {
      employee = await queryOne(
        `SELECT id, emp_id, full_name, email, phone, gender, date_of_birth, address, 
                department, designation, manager_name, doj, employment_type, probation_period, 
                confirmation_date, work_location, shift_timing, salary_package, bank_account_number, 
                ifsc_code, pan_number, aadhaar_number, username, profile_photo, status, 
                created_at, updated_at 
         FROM employees WHERE id = ?`,
        [parseInt(id)]
      );
    } else {
      employee = await queryOne(
        `SELECT id, emp_id, full_name, email, phone, gender, date_of_birth, address, 
                department, designation, manager_name, doj, employment_type, probation_period, 
                confirmation_date, work_location, shift_timing, salary_package, bank_account_number, 
                ifsc_code, pan_number, aadhaar_number, username, profile_photo, status, 
                created_at, updated_at 
         FROM employees WHERE id = ?`,
        [user.id]
      );
    }

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT update employee (HR only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth("hr");
    const { id } = await params;
    const body = await request.json();

    const existing = await queryOne("SELECT id FROM employees WHERE id = ?", [parseInt(id)]);
    if (!existing) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    const allowedFields = [
      "full_name", "email", "phone", "gender", "date_of_birth", "address",
      "department", "designation", "manager_name", "doj", "employment_type",
      "probation_period", "confirmation_date", "work_location", "shift_timing",
      "salary_package", "bank_account_number", "ifsc_code", "pan_number",
      "aadhaar_number", "username", "status", "profile_photo",
    ];

    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    // Handle password update separately
    if (body.password && body.password.length > 0) {
      const hashed = await hashPassword(body.password);
      setClauses.push("password = ?");
      values.push(hashed);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update" }, { status: 400 });
    }

    setClauses.push("updated_at = NOW()");
    values.push(parseInt(id));

    await execute(
      `UPDATE employees SET ${setClauses.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true, message: "Employee updated successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE employee (HR only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth("hr");
    const { id } = await params;
    const empId = parseInt(id);

    // Foreign key cascades will handle leaves, leave_balance, attendance
    await execute("DELETE FROM employees WHERE id = ?", [empId]);

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

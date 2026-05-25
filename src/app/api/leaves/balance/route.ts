import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, insert } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// GET leave balance (CL only)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const employeeId = searchParams.get("employee_id");

    if (user.role === "hr" && !employeeId) {
      // HR viewing all balances
      const balances = await query(
        `SELECT lb.*, e.full_name, e.emp_id 
         FROM leave_balance lb 
         LEFT JOIN employees e ON lb.employee_id = e.id 
         WHERE lb.month = ? AND lb.year = ?`,
        [month, year]
      );
      return NextResponse.json({ success: true, data: balances });
    }

    const targetId = user.role === "hr" && employeeId ? parseInt(employeeId) : user.id;

    let balance = await queryOne(
      "SELECT * FROM leave_balance WHERE employee_id = ? AND month = ? AND year = ?",
      [targetId, month, year]
    );

    if (!balance) {
      // Create default balance
      const newId = await insert(
        "INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) VALUES (?, ?, ?, 2, 0, 2)",
        [targetId, month, year]
      );
      balance = {
        id: newId,
        employee_id: targetId,
        month,
        year,
        total_cl: 2,
        used_cl: 0,
        remaining_cl: 2,
      };
    }

    return NextResponse.json({ success: true, data: balance });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Get balance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

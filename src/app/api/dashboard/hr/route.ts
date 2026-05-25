import { NextResponse } from "next/server";
import { query } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth("hr");

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Total employees
    const totalResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM employees"
    );
    const totalEmployees = totalResult[0].count;

    // Active employees
    const activeResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM employees WHERE status = 'active'"
    );
    const activeEmployees = activeResult[0].count;

    // Pending leaves
    const pendingResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM leaves WHERE status = 'pending'"
    );
    const pendingLeaves = pendingResult[0].count;

    // Approved leaves this month
    const approvedResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM leaves WHERE status = 'approved' AND MONTH(start_date) = ? AND YEAR(start_date) = ?",
      [currentMonth, currentYear]
    );
    const approvedLeavesThisMonth = approvedResult[0].count;

    // Department wise count
    const departmentWise = await query(
      "SELECT department, COUNT(*) as count FROM employees GROUP BY department ORDER BY count DESC"
    );

    // Recent leaves with employee names
    const recentLeaves = await query(
      `SELECT l.*, e.full_name as employee_name, e.emp_id 
       FROM leaves l 
       LEFT JOIN employees e ON l.employee_id = e.id 
       ORDER BY l.applied_at DESC 
       LIMIT 5`
    );

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        approvedLeavesThisMonth,
        departmentWise,
        recentLeaves,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("HR Dashboard error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

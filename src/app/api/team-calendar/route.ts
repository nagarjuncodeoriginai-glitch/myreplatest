import { NextRequest, NextResponse } from "next/server";
import { query } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// GET team calendar - shows who is on leave for a given month
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const department = searchParams.get("department") || "";

    // Get the first and last day of the month
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    let whereExtra = "";
    let params: (string | number | boolean | null | undefined)[] = [monthEnd, monthStart];

    if (department) {
      whereExtra = " AND e.department = ?";
      params.push(department);
    }

    const entries = await query(
      `SELECT l.employee_id, e.emp_id, e.full_name as employee_name, e.department, 
              l.leave_type, l.start_date, l.end_date, l.status
       FROM leaves l
       LEFT JOIN employees e ON l.employee_id = e.id
       WHERE l.status IN ('approved', 'pending')
       AND l.start_date <= ? AND l.end_date >= ?${whereExtra}`,
      params
    );

    // Get unique departments for filter
    const depts = await query<{ department: string }[]>(
      "SELECT DISTINCT department FROM employees WHERE department IS NOT NULL AND department != '' ORDER BY department"
    );
    const departments = depts.map((d) => d.department);

    return NextResponse.json({
      success: true,
      data: entries,
      departments,
      month,
      year,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Team calendar error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

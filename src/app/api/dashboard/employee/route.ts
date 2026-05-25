import { NextResponse } from "next/server";
import { query, queryOne, insert } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth("employee");

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get or create leave balance
    let balanceData = await queryOne(
      "SELECT * FROM leave_balance WHERE employee_id = ? AND month = ? AND year = ?",
      [user.id, currentMonth, currentYear]
    );

    if (!balanceData) {
      const newId = await insert(
        "INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) VALUES (?, ?, ?, 2, 0, 2)",
        [user.id, currentMonth, currentYear]
      );
      balanceData = {
        id: newId,
        employee_id: user.id,
        month: currentMonth,
        year: currentYear,
        total_cl: 2,
        used_cl: 0,
        remaining_cl: 2,
      } as typeof balanceData;
    }

    // Pending leaves count
    const pendingResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM leaves WHERE employee_id = ? AND status = 'pending'",
      [user.id]
    );
    const pendingLeaves = pendingResult[0].count;

    // Approved leaves this year
    const approvedResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM leaves WHERE employee_id = ? AND status = 'approved' AND YEAR(start_date) = ?",
      [user.id, currentYear]
    );
    const approvedLeaves = approvedResult[0].count;

    // Recent leaves
    const recentLeaves = await query(
      "SELECT * FROM leaves WHERE employee_id = ? ORDER BY applied_at DESC LIMIT 5",
      [user.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        leaveBalance: balanceData,
        pendingLeaves,
        approvedLeaves,
        recentLeaves,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Employee Dashboard error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

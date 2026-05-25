import { NextResponse } from "next/server";
import { query, execute } from "@/database/connection";

// POST - Monthly leave reset
export async function POST() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get all active employees
    const activeEmployees = await query<{ id: number }[]>(
      "SELECT id FROM employees WHERE status = 'active'"
    );

    let resetCount = 0;

    for (const emp of activeEmployees) {
      // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both cases
      await execute(
        `INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) 
         VALUES (?, ?, ?, 2, 0, 2) 
         ON DUPLICATE KEY UPDATE total_cl = 2, used_cl = 0, remaining_cl = 2`,
        [emp.id, currentMonth, currentYear]
      );
      resetCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Leave balance reset for ${resetCount} employees for ${currentMonth}/${currentYear}`,
    });
  } catch (error) {
    console.error("Leave reset error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

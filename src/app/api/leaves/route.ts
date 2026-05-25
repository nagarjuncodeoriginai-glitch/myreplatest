import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, insert } from "@/database/connection";
import { requireAuth } from "@/lib/auth";
import { leaveApplicationSchema } from "@/lib/validations";

// GET leaves
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let params: unknown[] = [];

    // Employees can only see their own leaves
    if (user.role === "employee") {
      whereClauses.push("l.employee_id = ?");
      params.push(user.id);
    }

    if (status) {
      whereClauses.push("l.status = ?");
      params.push(status);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Get total count
    const countResult = await query<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM leaves l ${whereStr}`,
      params
    );
    const total = countResult[0].total;

    // Get paginated leaves with employee names
    const leaves = await query(
      `SELECT l.*, e.full_name as employee_name, e.emp_id 
       FROM leaves l 
       LEFT JOIN employees e ON l.employee_id = e.id 
       ${whereStr} 
       ORDER BY l.applied_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: leaves,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Get leaves error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST apply for leave (Employee only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("employee");
    const body = await request.json();
    const validation = leaveApplicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { start_date, end_date, reason } = validation.data;

    // Calculate number of leave days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Validate dates
    if (start > end) {
      return NextResponse.json(
        { success: false, message: "End date must be after start date" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return NextResponse.json(
        { success: false, message: "Cannot apply for past dates" },
        { status: 400 }
      );
    }

    // Check leave balance for the month
    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    let balance = await queryOne<{ id: number; remaining_cl: number }>(
      "SELECT id, remaining_cl FROM leave_balance WHERE employee_id = ? AND month = ? AND year = ?",
      [user.id, month, year]
    );

    if (!balance) {
      // Create balance for this month
      const balanceId = await insert(
        "INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) VALUES (?, ?, ?, 2, 0, 2)",
        [user.id, month, year]
      );
      balance = { id: balanceId, remaining_cl: 2 };
    }

    if (balance.remaining_cl < diffDays) {
      return NextResponse.json(
        { success: false, message: `Insufficient leave balance. You have ${balance.remaining_cl} CL remaining this month.` },
        { status: 400 }
      );
    }

    // Check pending leaves that haven't been approved yet
    const pendingResult = await query<{ pending_days: number }[]>(
      `SELECT COALESCE(SUM(DATEDIFF(end_date, start_date) + 1), 0) as pending_days 
       FROM leaves 
       WHERE employee_id = ? AND status = 'pending' 
       AND MONTH(start_date) = ? AND YEAR(start_date) = ?`,
      [user.id, month, year]
    );
    const pendingDays = pendingResult[0].pending_days;

    if (balance.remaining_cl - pendingDays < diffDays) {
      return NextResponse.json(
        { success: false, message: `Insufficient leave balance. You have ${balance.remaining_cl - pendingDays} CL available (${pendingDays} day(s) pending approval).` },
        { status: 400 }
      );
    }

    // Create leave application
    const newLeaveId = await insert(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status) 
       VALUES (?, 'CL', ?, ?, ?, 'pending')`,
      [user.id, start_date, end_date, reason]
    );

    // Create notification for HR
    const emp = await queryOne<{ full_name: string }>(
      "SELECT full_name FROM employees WHERE id = ?",
      [user.id]
    );

    await insert(
      `INSERT INTO notifications (user_id, user_role, type, title, message, is_read, related_id) 
       VALUES (1, 'hr', 'leave_applied', 'New Leave Request', ?, 0, ?)`,
      [`${emp?.full_name || "Employee"} applied for Casual Leave (${start_date} to ${end_date})`, newLeaveId]
    );

    return NextResponse.json(
      { success: true, message: "Leave application submitted successfully", id: newLeaveId },
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
    console.error("Apply leave error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

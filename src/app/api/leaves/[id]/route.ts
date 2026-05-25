import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, insert, execute } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// PUT - Approve/Reject leave (HR only) OR Cancel leave (Employee)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const leave = await queryOne<{
      id: number;
      employee_id: number;
      status: string;
      start_date: string;
      end_date: string;
    }>(
      "SELECT id, employee_id, status, start_date, end_date FROM leaves WHERE id = ?",
      [parseInt(id)]
    );

    if (!leave) {
      return NextResponse.json({ success: false, message: "Leave not found" }, { status: 404 });
    }

    // Employee cancellation
    if (action === "cancelled") {
      if (user.role !== "employee" || leave.employee_id !== user.id) {
        return NextResponse.json(
          { success: false, message: "You can only cancel your own leave requests" },
          { status: 403 }
        );
      }

      if (leave.status !== "pending") {
        return NextResponse.json(
          { success: false, message: "Only pending leaves can be cancelled" },
          { status: 400 }
        );
      }

      await execute(
        "UPDATE leaves SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?",
        [leave.id]
      );

      // Notify HR about cancellation
      const emp = await queryOne<{ full_name: string }>(
        "SELECT full_name FROM employees WHERE id = ?",
        [user.id]
      );

      await insert(
        `INSERT INTO notifications (user_id, user_role, type, title, message, is_read, related_id) 
         VALUES (1, 'hr', 'leave_cancelled', 'Leave Cancelled', ?, 0, ?)`,
        [`${emp?.full_name || "Employee"} cancelled their CL request (${leave.start_date} to ${leave.end_date})`, leave.id]
      );

      return NextResponse.json({
        success: true,
        message: "Leave cancelled successfully",
      });
    }

    // HR approval/rejection
    if (user.role !== "hr") {
      return NextResponse.json(
        { success: false, message: "Only HR can approve or reject leaves" },
        { status: 403 }
      );
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'approved', 'rejected', or 'cancelled'" },
        { status: 400 }
      );
    }

    if (leave.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Leave already processed" },
        { status: 400 }
      );
    }

    // Update leave status
    await execute(
      "UPDATE leaves SET status = ?, reviewed_at = NOW(), reviewed_by = 'HR Admin' WHERE id = ?",
      [action, leave.id]
    );

    // If approved, update leave balance
    if (action === "approved") {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const month = start.getMonth() + 1;
      const year = start.getFullYear();

      const existingBalance = await queryOne<{ id: number }>(
        "SELECT id FROM leave_balance WHERE employee_id = ? AND month = ? AND year = ?",
        [leave.employee_id, month, year]
      );

      if (existingBalance) {
        await execute(
          "UPDATE leave_balance SET used_cl = used_cl + ?, remaining_cl = remaining_cl - ? WHERE id = ?",
          [diffDays, diffDays, existingBalance.id]
        );
      } else {
        await insert(
          "INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) VALUES (?, ?, ?, 2, ?, ?)",
          [leave.employee_id, month, year, diffDays, 2 - diffDays]
        );
      }
    }

    // Notify the employee
    const notifType = action === "approved" ? "leave_approved" : "leave_rejected";
    const notifTitle = action === "approved" ? "Leave Approved" : "Leave Rejected";

    await insert(
      `INSERT INTO notifications (user_id, user_role, type, title, message, is_read, related_id) 
       VALUES (?, 'employee', ?, ?, ?, 0, ?)`,
      [
        leave.employee_id,
        notifType,
        notifTitle,
        `Your Casual Leave request (${leave.start_date} to ${leave.end_date}) has been ${action}.`,
        leave.id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Leave ${action} successfully`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Leave action error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

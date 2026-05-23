import { NextRequest, NextResponse } from "next/server";
import { getData, saveData, getNextId } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// PUT - Approve/Reject leave (HR only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth("hr");
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const db = getData();
    const leaveIndex = db.leaves.findIndex((l) => l.id === parseInt(id));

    if (leaveIndex === -1) {
      return NextResponse.json({ success: false, message: "Leave not found" }, { status: 404 });
    }

    const leave = db.leaves[leaveIndex];

    if (leave.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Leave already processed" },
        { status: 400 }
      );
    }

    // Update leave status
    db.leaves[leaveIndex].status = action;
    db.leaves[leaveIndex].reviewed_at = new Date().toISOString();
    db.leaves[leaveIndex].reviewed_by = "HR Admin";

    // If approved, update leave balance
    if (action === "approved") {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const month = start.getMonth() + 1;
      const year = start.getFullYear();

      const balanceIndex = db.leave_balance.findIndex(
        (lb) => lb.employee_id === leave.employee_id && lb.month === month && lb.year === year
      );

      if (balanceIndex !== -1) {
        db.leave_balance[balanceIndex].used_cl += diffDays;
        db.leave_balance[balanceIndex].remaining_cl -= diffDays;
      } else {
        db.leave_balance.push({
          id: getNextId(db.leave_balance),
          employee_id: leave.employee_id,
          month,
          year,
          total_cl: 2,
          used_cl: diffDays,
          remaining_cl: 2 - diffDays,
        });
      }
    }

    saveData(db);

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

import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, insert, execute } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// GET attendance records
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || "";
    const employeeId = searchParams.get("employee_id") || "";

    let whereClauses: string[] = [];
    let params: unknown[] = [];

    // Employees can only see their own
    if (user.role === "employee") {
      whereClauses.push("employee_id = ?");
      params.push(user.id);
    }

    if (date) {
      whereClauses.push("date = ?");
      params.push(date);
    }
    if (employeeId) {
      whereClauses.push("employee_id = ?");
      params.push(parseInt(employeeId));
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const records = await query(
      `SELECT * FROM attendance ${whereStr} ORDER BY date DESC, check_in DESC`,
      params
    );

    return NextResponse.json({
      success: true,
      data: records,
      total: (records as unknown[]).length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Get attendance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// Helper: parse time string like "03:15 pm" or "15:15" to minutes
function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
  if (!match) return -1;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = match[3];
  if (period) {
    const p = period.toUpperCase();
    if (p === "PM" && h !== 12) h += 12;
    if (p === "AM" && h === 12) h = 0;
  }
  return h * 60 + m;
}

// POST check-in or check-out
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("employee");
    const body = await request.json();
    const { action, location, latitude, longitude } = body;

    if (!action || !["check_in", "check_out"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'check_in' or 'check_out'" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    // Find employee info
    const employee = await queryOne<{ id: number; emp_id: string; full_name: string }>(
      "SELECT id, emp_id, full_name FROM employees WHERE id = ?",
      [user.id]
    );

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    // Check if there's already a record for today
    const existing = await queryOne<{ id: number; check_in: string | null; check_out: string | null }>(
      "SELECT id, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ?",
      [user.id, today]
    );

    if (action === "check_in") {
      if (existing && existing.check_in) {
        return NextResponse.json(
          { success: false, message: "Already checked in today" },
          { status: 400 }
        );
      }

      const isLate = now.getHours() > 10 || (now.getHours() === 10 && now.getMinutes() > 30);
      const locationStr = location || (latitude && longitude ? `Lat: ${latitude}, Lng: ${longitude}` : "Unknown");
      const status = isLate ? "late" : "present";

      if (existing) {
        await execute(
          "UPDATE attendance SET check_in = ?, check_in_location = ?, status = ? WHERE id = ?",
          [timeStr, locationStr, status, existing.id]
        );
      } else {
        await insert(
          `INSERT INTO attendance (employee_id, emp_id, full_name, date, check_in, check_in_location, status, hours, is_auto) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
          [user.id, employee.emp_id, employee.full_name, today, timeStr, locationStr, status]
        );
      }

      return NextResponse.json({
        success: true,
        message: `Checked in at ${timeStr}`,
        data: { time: timeStr, location: locationStr, status },
      });
    }

    if (action === "check_out") {
      if (!existing || !existing.check_in) {
        return NextResponse.json(
          { success: false, message: "Not checked in today" },
          { status: 400 }
        );
      }
      if (existing.check_out) {
        return NextResponse.json(
          { success: false, message: "Already checked out today" },
          { status: 400 }
        );
      }

      const locationStr = location || (latitude && longitude ? `Lat: ${latitude}, Lng: ${longitude}` : "Unknown");

      // Calculate hours worked
      const checkInMinutes = parseTimeToMinutes(existing.check_in);
      const checkOutMinutes = now.getHours() * 60 + now.getMinutes();
      let hoursWorked = 0;
      if (checkInMinutes >= 0 && checkOutMinutes > checkInMinutes) {
        hoursWorked = (checkOutMinutes - checkInMinutes) / 60;
      }

      await execute(
        "UPDATE attendance SET check_out = ?, check_out_location = ?, hours = ? WHERE id = ?",
        [timeStr, locationStr, parseFloat(hoursWorked.toFixed(1)), existing.id]
      );

      return NextResponse.json({
        success: true,
        message: `Checked out at ${timeStr}. Worked ${hoursWorked.toFixed(1)} hours.`,
        data: { time: timeStr, hours: parseFloat(hoursWorked.toFixed(1)) },
      });
    }

    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Attendance action error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE attendance record (HR only)
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth("hr");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Attendance record ID is required" },
        { status: 400 }
      );
    }

    const affected = await execute("DELETE FROM attendance WHERE id = ?", [parseInt(id)]);

    if (affected === 0) {
      return NextResponse.json(
        { success: false, message: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Delete attendance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

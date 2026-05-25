import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// GET notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    let whereClause = "WHERE user_id = ? AND user_role = ?";
    let params: (string | number | boolean | null | undefined)[] = [user.id, user.role];

    if (unreadOnly) {
      whereClause += " AND is_read = 0";
    }

    const notifications = await query(
      `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ?`,
      [...params, limit]
    );

    // Get unread count
    const unreadResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND user_role = ? AND is_read = 0",
      [user.id, user.role]
    );
    const unreadCount = unreadResult[0].count;

    // Get total count
    const totalResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND user_role = ?",
      [user.id, user.role]
    );

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
      total: totalResult[0].count,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Get notifications error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { notification_ids, mark_all } = body;

    if (mark_all) {
      await execute(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND user_role = ?",
        [user.id, user.role]
      );
    } else if (notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0) {
      const placeholders = notification_ids.map(() => "?").join(",");
      await execute(
        `UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders}) AND user_id = ? AND user_role = ?`,
        [...notification_ids, user.id, user.role]
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Provide notification_ids array or mark_all: true" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Update notifications error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

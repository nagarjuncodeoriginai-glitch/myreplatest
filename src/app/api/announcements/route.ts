import { NextRequest, NextResponse } from "next/server";
import { query, insert } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// GET all announcements (accessible by both HR and employees)
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const priority = searchParams.get("priority") || "";

    let whereClauses: string[] = ["is_active = 1"];
    let params: unknown[] = [];

    if (category) {
      whereClauses.push("category = ?");
      params.push(category);
    }
    if (priority) {
      whereClauses.push("priority = ?");
      params.push(priority);
    }

    const whereStr = `WHERE ${whereClauses.join(" AND ")}`;

    const announcements = await query(
      `SELECT id, title, content, category, date, priority, author, is_active as isActive 
       FROM announcements ${whereStr} ORDER BY date DESC`,
      params
    );

    return NextResponse.json({
      success: true,
      data: announcements,
      total: (announcements as unknown[]).length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Get announcements error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST create a new announcement (HR only)
export async function POST(request: NextRequest) {
  try {
    await requireAuth("hr");
    const body = await request.json();
    const { title, content, category, priority } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, message: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    const validCategories = ["general", "policy", "event", "celebration", "important", "update"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const newId = await insert(
      "INSERT INTO announcements (title, content, category, date, priority, author, is_active) VALUES (?, ?, ?, ?, ?, 'HR Admin', 1)",
      [title, content, category, today, priority || "medium"]
    );

    const newAnnouncement = {
      id: newId,
      title,
      content,
      category,
      date: today,
      priority: priority || "medium",
      author: "HR Admin",
      isActive: true,
    };

    return NextResponse.json(
      { success: true, message: "Announcement created successfully", data: newAnnouncement },
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
    console.error("Create announcement error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

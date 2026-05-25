import { NextRequest, NextResponse } from "next/server";
import { query, insert } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// GET all holidays (accessible by both HR and employees)
export async function GET() {
  try {
    await requireAuth();

    const holidays = await query(
      "SELECT * FROM holidays ORDER BY date ASC"
    );

    return NextResponse.json({
      success: true,
      data: holidays,
      total: (holidays as unknown[]).length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Get holidays error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST create a new holiday (HR only)
export async function POST(request: NextRequest) {
  try {
    await requireAuth("hr");
    const body = await request.json();
    const { name, date, type } = body;

    if (!name || !date || !type) {
      return NextResponse.json(
        { success: false, message: "Name, date, and type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["national", "religious", "company", "optional"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid holiday type" },
        { status: 400 }
      );
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = dayNames[new Date(date).getDay()];

    const newId = await insert(
      "INSERT INTO holidays (name, date, type, day) VALUES (?, ?, ?, ?)",
      [name, date, type, day]
    );

    return NextResponse.json(
      { success: true, message: "Holiday created successfully", data: { id: newId, name, date, type, day } },
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
    console.error("Create holiday error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

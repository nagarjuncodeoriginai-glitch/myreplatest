import { NextResponse } from "next/server";
import { query } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth("hr");

    const departments = await query<{ department: string; count: number }[]>(
      `SELECT department, COUNT(*) as count FROM employees 
       GROUP BY department ORDER BY department ASC`
    );

    return NextResponse.json({ success: true, data: departments });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

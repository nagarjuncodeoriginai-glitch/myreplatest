import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { queryOne } from "@/database/connection";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role === "hr") {
      return NextResponse.json({
        success: true,
        user: { id: user.id, username: user.username, role: "hr" },
      });
    }

    const employee = await queryOne<{ id: number; emp_id: string; full_name: string; email: string; department: string; designation: string; profile_photo: string }>(
      "SELECT id, emp_id, full_name, email, department, designation, profile_photo FROM employees WHERE id = ?",
      [user.id]
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: employee.id,
        emp_id: employee.emp_id,
        username: user.username,
        name: employee.full_name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        profile_photo: employee.profile_photo,
        role: "employee",
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

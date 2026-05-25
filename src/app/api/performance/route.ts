import { NextRequest, NextResponse } from "next/server";
import { query, insert, execute, queryOne } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// GET all performance data (goals, feedback, skills)
export async function GET() {
  try {
    const user = await requireAuth();

    let goals, feedback, skills;

    if (user.role === "employee" && user.emp_id) {
      goals = await query("SELECT * FROM performance_goals WHERE employee_id = ?", [user.emp_id]);
      feedback = await query("SELECT * FROM performance_feedback WHERE employee_id = ?", [user.emp_id]);
      skills = await query("SELECT skill, rating, max_rating as `max`, employee_id as employeeId FROM performance_skills WHERE employee_id = ?", [user.emp_id]);
    } else {
      goals = await query("SELECT * FROM performance_goals");
      feedback = await query("SELECT * FROM performance_feedback");
      skills = await query("SELECT skill, rating, max_rating as `max`, employee_id as employeeId FROM performance_skills");
    }

    return NextResponse.json({
      success: true,
      data: {
        goals,
        feedback,
        skills,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Get performance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST - Add goal, feedback, or skill
export async function POST(request: NextRequest) {
  try {
    await requireAuth("hr");
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, message: "type and data are required" },
        { status: 400 }
      );
    }

    if (type === "goal") {
      if (!data.title || !data.employeeId || !data.dueDate || !data.category) {
        return NextResponse.json(
          { success: false, message: "title, employeeId, dueDate, category are required" },
          { status: 400 }
        );
      }
      const newId = await insert(
        `INSERT INTO performance_goals (title, description, progress, status, due_date, category, assigned_by, employee_id) 
         VALUES (?, ?, ?, ?, ?, ?, 'HR Admin', ?)`,
        [data.title, data.description || "", data.progress || 0, data.status || "not_started", data.dueDate, data.category, data.employeeId]
      );
      return NextResponse.json({
        success: true,
        message: "Goal assigned",
        data: { id: newId, ...data, assignedBy: "HR Admin", assignedAt: new Date().toISOString() },
      }, { status: 201 });
    }

    if (type === "feedback") {
      if (!data.message || !data.employeeId) {
        return NextResponse.json(
          { success: false, message: "message and employeeId are required" },
          { status: 400 }
        );
      }
      const today = new Date().toISOString().split("T")[0];
      const newId = await insert(
        `INSERT INTO performance_feedback (from_person, role, message, rating, date, type, employee_id) 
         VALUES ('HR Admin', 'HR', ?, ?, ?, ?, ?)`,
        [data.message, data.rating || 5, today, data.type || "general", data.employeeId]
      );
      return NextResponse.json({
        success: true,
        message: "Feedback submitted",
        data: { id: newId, from: "HR Admin", role: "HR", message: data.message, rating: data.rating || 5, date: today, type: data.type || "general", employeeId: data.employeeId },
      }, { status: 201 });
    }

    if (type === "skill") {
      if (!data.skill || !data.employeeId) {
        return NextResponse.json(
          { success: false, message: "skill and employeeId are required" },
          { status: 400 }
        );
      }
      // Use INSERT ... ON DUPLICATE KEY UPDATE
      await execute(
        `INSERT INTO performance_skills (skill, rating, max_rating, employee_id) 
         VALUES (?, ?, 5, ?) 
         ON DUPLICATE KEY UPDATE rating = ?`,
        [data.skill, data.rating || 3, data.employeeId, data.rating || 3]
      );
      return NextResponse.json({
        success: true,
        message: "Skill rated",
        data: { skill: data.skill, rating: data.rating || 3, max: 5, employeeId: data.employeeId },
      }, { status: 201 });
    }

    return NextResponse.json({ success: false, message: "Invalid type. Use: goal, feedback, skill" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Create performance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update a goal
export async function PUT(request: NextRequest) {
  try {
    await requireAuth("hr");
    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !data) {
      return NextResponse.json({ success: false, message: "type and data required" }, { status: 400 });
    }

    if (type === "goal") {
      const existing = await queryOne("SELECT id FROM performance_goals WHERE id = ?", [id]);
      if (!existing) {
        return NextResponse.json({ success: false, message: "Goal not found" }, { status: 404 });
      }

      const setClauses: string[] = [];
      const values: (string | number | boolean | null | undefined)[] = [];

      if (data.title !== undefined) { setClauses.push("title = ?"); values.push(data.title); }
      if (data.description !== undefined) { setClauses.push("description = ?"); values.push(data.description); }
      if (data.progress !== undefined) { setClauses.push("progress = ?"); values.push(data.progress); }
      if (data.status !== undefined) { setClauses.push("status = ?"); values.push(data.status); }
      if (data.dueDate !== undefined) { setClauses.push("due_date = ?"); values.push(data.dueDate); }
      if (data.category !== undefined) { setClauses.push("category = ?"); values.push(data.category); }
      if (data.employeeId !== undefined) { setClauses.push("employee_id = ?"); values.push(data.employeeId); }

      if (setClauses.length > 0) {
        values.push(id);
        await execute(`UPDATE performance_goals SET ${setClauses.join(", ")} WHERE id = ?`, values);
      }

      return NextResponse.json({ success: true, message: "Goal updated" });
    }

    return NextResponse.json({ success: false, message: "Only goal updates supported" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Update performance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove goal or feedback
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth("hr");
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = parseInt(searchParams.get("id") || "0");

    if (!type || !id) {
      return NextResponse.json({ success: false, message: "type and id required" }, { status: 400 });
    }

    if (type === "goal") {
      const affected = await execute("DELETE FROM performance_goals WHERE id = ?", [id]);
      if (affected === 0) {
        return NextResponse.json({ success: false, message: "Goal not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Goal deleted" });
    }

    if (type === "feedback") {
      const affected = await execute("DELETE FROM performance_feedback WHERE id = ?", [id]);
      if (affected === 0) {
        return NextResponse.json({ success: false, message: "Feedback not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Feedback deleted" });
    }

    return NextResponse.json({ success: false, message: "Invalid type. Use: goal, feedback" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Delete performance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

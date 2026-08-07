import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateEmployeeSchema } from "@/lib/validations/employee";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Fetch department separately
    let department = null;
    if (data.department_id) {
      const { data: dept } = await supabase
        .from("departments")
        .select("name")
        .eq("id", data.department_id)
        .single();
      department = dept;
    }

    return NextResponse.json({ employee: { ...data, departments: department } });
  } catch (error) {
    console.error("Get employee error:", error);
    return NextResponse.json({ error: "Failed to get employee" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isOwnProfile = user.id === id;
    const isAdmin = profile?.role === "admin";

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    let updateData;
    if (isAdmin) {
      updateData = {
        full_name: body.full_name,
        phone: body.phone || null,
        designation: body.designation || null,
        department_id: body.department_id || null,
        manager_id: body.manager_id || null,
        office_location: body.office_location || null,
        role: body.role || "employee",
        status: body.status || "active",
      };
    } else {
      const { full_name, phone, office_location } = body;
      updateData = { full_name, phone, office_location };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    console.log("Updated employee:", data);
    return NextResponse.json({ employee: data, message: "Employee updated successfully" });
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ message: "Employee deactivated successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}

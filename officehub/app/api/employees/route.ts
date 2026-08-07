import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEmployeeSchema } from "@/lib/validations/employee";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profile?.role === "manager") {
      query = query.eq("manager_id", user.id);
    }

    const department = searchParams.get("department");
    if (department) query = query.eq("department_id", department);

    const status = searchParams.get("status");
    if (status) query = query.eq("status", status);

    const search = searchParams.get("search");
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Fetch departments for all employees
    const deptIds = [...new Set(data?.map((e) => e.department_id).filter(Boolean) || [])];
    let departments: Record<string, { name: string }> = {};
    if (deptIds.length > 0) {
      const { data: depts } = await supabase
        .from("departments")
        .select("id, name")
        .in("id", deptIds);
      depts?.forEach((d) => { departments[d.id] = { name: d.name }; });
    }

    const employees = data?.map((emp) => ({
      ...emp,
      departments: emp.department_id ? departments[emp.department_id] || null : null,
    })) || [];

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Get employees error:", error);
    return NextResponse.json({ error: "Failed to get employees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    const body = await request.json();
    const validatedData = createEmployeeSchema.parse(body);

    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const employeeId = `EMP-${String((count || 0) + 1).padStart(3, "0")}`;

    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      email_confirm: true,
      password: "changeme123",
      user_metadata: { full_name: validatedData.full_name },
    });

    if (signUpError) throw signUpError;

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        employee_id: employeeId,
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        department_id: validatedData.department_id || null,
        manager_id: validatedData.manager_id || null,
        designation: validatedData.designation || null,
        joining_date: validatedData.joining_date || null,
        office_location: validatedData.office_location || null,
        role: validatedData.role,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ employee: data, message: "Employee created successfully" });
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

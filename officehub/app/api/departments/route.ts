import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDepartmentSchema } from "@/lib/validations/department";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    if (error) throw error;
    return NextResponse.json({ departments: data });
  } catch (error) {
    console.error("Get departments error:", error);
    return NextResponse.json({ error: "Failed to get departments" }, { status: 500 });
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
    const validatedData = createDepartmentSchema.parse(body);

    const { data, error } = await supabase
      .from("departments")
      .insert({ name: validatedData.name })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ department: data, message: "Department created" });
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}

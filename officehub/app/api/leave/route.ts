import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLeaveRequestSchema } from "@/lib/validations/leave";

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
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (profile?.role === "employee") {
      query = query.eq("user_id", user.id);
    }

    const status = searchParams.get("status");
    if (status) query = query.eq("status", status);

    const leaveType = searchParams.get("leave_type");
    if (leaveType) query = query.eq("leave_type", leaveType);

    const { data, error } = await query;
    if (error) throw error;

    const userIds = [...new Set(data?.map((r) => r.user_id).filter(Boolean) || [])];
    let profilesMap: Record<string, { full_name: string; employee_id: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, employee_id")
        .in("id", userIds);
      profiles?.forEach((p) => { profilesMap[p.id] = p; });
    }

    const requests = data?.map((r) => ({ ...r, profiles: profilesMap[r.user_id] || null })) || [];
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get leave requests error:", error);
    return NextResponse.json({ error: "Failed to get leave requests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createLeaveRequestSchema.parse(body);

    const { data, error } = await supabase
      .from("leave_requests")
      .insert({
        user_id: user.id,
        leave_type: validatedData.leave_type,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        reason: validatedData.reason,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ request: data, message: "Leave request submitted" });
  } catch (error) {
    console.error("Create leave request error:", error);
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}

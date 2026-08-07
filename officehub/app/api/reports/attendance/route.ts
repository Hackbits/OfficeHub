import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const employeeId = searchParams.get("employee_id");

    let query = supabase
      .from("attendance")
      .select("*")
      .order("date", { ascending: false });

    if (profile?.role === "employee") {
      query = query.eq("user_id", user.id);
    } else if (employeeId) {
      query = query.eq("user_id", employeeId);
    }

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    const { data, error } = await query;
    if (error) throw error;

    const userIds = [...new Set(data?.map((r) => r.user_id).filter(Boolean) || [])];
    let profilesMap: Record<string, { full_name: string; employee_id: string; department_id: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, employee_id, department_id")
        .in("id", userIds);
      profiles?.forEach((p) => { profilesMap[p.id] = p; });
    }

    const deptIds = [...new Set(Object.values(profilesMap).map((p) => p.department_id).filter(Boolean) || [])];
    let departmentsMap: Record<string, { name: string }> = {};
    if (deptIds.length > 0) {
      const { data: depts } = await supabase
        .from("departments")
        .select("id, name")
        .in("id", deptIds);
      depts?.forEach((d) => { departmentsMap[d.id] = d; });
    }

    const records = data?.map((r) => {
      const p = profilesMap[r.user_id] || null;
      return {
        ...r,
        profiles: p ? { ...p, departments: p.department_id ? departmentsMap[p.department_id] || null : null } : null,
      };
    }) || [];

    const totalDays = records.length;
    const presentDays = records.filter((d) => d.status === "present" || d.status === "late").length;
    const absentDays = records.filter((d) => d.status === "absent").length;
    const wfhDays = records.filter((d) => d.status === "wfh").length;
    const leaveDays = records.filter((d) => d.status === "leave").length;
    const avgHours = records.length
      ? records.reduce((sum, d) => sum + (d.working_hours || 0), 0) / records.length
      : 0;

    return NextResponse.json({
      records,
      summary: {
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        wfh_days: wfhDays,
        leave_days: leaveDays,
        average_hours: Math.round(avgHours * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Get attendance report error:", error);
    return NextResponse.json({ error: "Failed to get attendance report" }, { status: 500 });
  }
}

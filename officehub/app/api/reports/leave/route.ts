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
    const leaveType = searchParams.get("leave_type");

    let query = supabase
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (profile?.role === "employee") {
      query = query.eq("user_id", user.id);
    }

    if (startDate) query = query.gte("start_date", startDate);
    if (endDate) query = query.lte("end_date", endDate);
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

    const records = data?.map((r) => ({ ...r, profiles: profilesMap[r.user_id] || null })) || [];

    const byType = {
      casual: { total: 0, approved: 0, rejected: 0, pending: 0 },
      sick: { total: 0, approved: 0, rejected: 0, pending: 0 },
      paid: { total: 0, approved: 0, rejected: 0, pending: 0 },
      unpaid: { total: 0, approved: 0, rejected: 0, pending: 0 },
      optional: { total: 0, approved: 0, rejected: 0, pending: 0 },
    };

    records?.forEach((req) => {
      const type = req.leave_type as keyof typeof byType;
      if (byType[type]) {
        byType[type].total++;
        if (req.status === "approved") byType[type].approved++;
        if (req.status === "rejected") byType[type].rejected++;
        if (req.status === "pending") byType[type].pending++;
      }
    });

    return NextResponse.json({ records, summary: byType });
  } catch (error) {
    console.error("Get leave report error:", error);
    return NextResponse.json({ error: "Failed to get leave report" }, { status: 500 });
  }
}

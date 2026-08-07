import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      .from("leave_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    let profile = null;
    if (data.user_id) {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, full_name, employee_id")
        .eq("id", data.user_id)
        .single();
      profile = p || null;
    }

    return NextResponse.json({ request: { ...data, profiles: profile } });
  } catch (error) {
    console.error("Get leave request error:", error);
    return NextResponse.json({ error: "Failed to get leave request" }, { status: 500 });
  }
}

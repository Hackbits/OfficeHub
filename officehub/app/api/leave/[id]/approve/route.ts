import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    if (profile?.role !== "manager" && profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("leave_requests")
      .update({ status: "approved", approved_by: user.id })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update leave balance
    if (data) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const year = startDate.getFullYear();

      const { data: balance } = await supabase
        .from("leave_balances")
        .select("id, used_days")
        .eq("user_id", data.user_id)
        .eq("leave_type", data.leave_type)
        .eq("year", year)
        .single();

      if (balance) {
        await supabase
          .from("leave_balances")
          .update({ used_days: balance.used_days + daysDiff })
          .eq("id", balance.id);
      } else {
        await supabase
          .from("leave_balances")
          .insert({
            user_id: data.user_id,
            leave_type: data.leave_type,
            year,
            total_days: data.leave_type === "casual" ? 10 : data.leave_type === "sick" ? 10 : data.leave_type === "paid" ? 10 : 2,
            used_days: daysDiff,
          });
      }
    }

    return NextResponse.json({ message: "Leave request approved" });
  } catch (error) {
    console.error("Approve leave error:", error);
    return NextResponse.json({ error: "Failed to approve leave" }, { status: 500 });
  }
}

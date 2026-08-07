import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const year = new Date().getFullYear();

    const { data, error } = await supabase
      .from("leave_balances")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", year);

    if (error) throw error;

    const balances = {
      casual: { total: 10, used: 0 },
      sick: { total: 10, used: 0 },
      paid: { total: 10, used: 0 },
      unpaid: { total: 999, used: 0 },
      optional: { total: 2, used: 0 },
    };

    data?.forEach((b) => {
      if (b.leave_type in balances) {
        balances[b.leave_type as keyof typeof balances] = {
          total: b.total_days,
          used: b.used_days,
        };
      }
    });

    return NextResponse.json({ balances });
  } catch (error) {
    console.error("Get leave balance error:", error);
    return NextResponse.json({ error: "Failed to get leave balance" }, { status: 500 });
  }
}

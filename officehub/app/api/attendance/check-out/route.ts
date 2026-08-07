import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTodayAttendance, getOfficeSettings } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const attendance = await getTodayAttendance(user.id);
    if (!attendance) {
      return NextResponse.json(
        { error: "No check-in found for today" },
        { status: 400 }
      );
    }

    if (attendance.check_out) {
      return NextResponse.json(
        { error: "Already checked out today" },
        { status: 400 }
      );
    }

    if (!attendance.check_in) {
      return NextResponse.json(
        { error: "Check-in time not found" },
        { status: 400 }
      );
    }

    const settings = await getOfficeSettings();

    const checkIn = new Date(attendance.check_in);
    const checkOut = new Date();
    const workingHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    let status = attendance.status;
    if (workingHours < settings.half_day_max) {
      status = "half_day";
    } else if (workingHours >= settings.overtime_threshold) {
      status = "overtime";
    }

    const { data, error } = await supabase
      .from("attendance")
      .update({
        check_out: checkOut.toISOString(),
        working_hours: Math.round(workingHours * 100) / 100,
        status,
      })
      .eq("id", attendance.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      attendance: data,
      working_hours: Math.round(workingHours * 100) / 100,
      message: "Checked out successfully",
    });
  } catch (error) {
    console.error("Check-out error:", error);
    return NextResponse.json(
      { error: "Failed to check out" },
      { status: 500 }
    );
  }
}

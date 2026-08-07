import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWithinGeofence } from "@/lib/geo";
import { getTodayAttendance, getOfficeSettings } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const existing = await getTodayAttendance(user.id);
    if (existing) {
      return NextResponse.json(
        { error: "Already checked in today" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { latitude, longitude, device_info, ip_address } = body;

    const settings = await getOfficeSettings();

    const today = new Date().toISOString().split("T")[0];
    const { data: holiday } = await supabase
      .from("holidays")
      .select("id")
      .eq("date", today)
      .single();

    if (holiday) {
      return NextResponse.json(
        { error: "Today is a holiday. No check-in required." },
        { status: 400 }
      );
    }

    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json(
        { error: "Today is a weekend. No check-in required." },
        { status: 400 }
      );
    }

    const { data: wfhRequest } = await supabase
      .from("wfh_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .lte("start_date", today)
      .gte("end_date", today)
      .single();

    const isWFH = !!wfhRequest;

    if (!isWFH) {
      if (latitude === undefined || longitude === undefined) {
        return NextResponse.json(
          { error: "GPS coordinates required for office check-in" },
          { status: 400 }
        );
      }

      const withinGeofence = isWithinGeofence(
        latitude,
        longitude,
        settings.office_latitude,
        settings.office_longitude,
        settings.geofence_radius
      );

      if (!withinGeofence) {
        return NextResponse.json(
          { error: "Outside office geofence. You must be within the office to check in." },
          { status: 400 }
        );
      }
    }

    const checkInTime = new Date();
    const [startHour, startMin] = settings.office_start.split(":").map(Number);
    const officeStart = new Date();
    officeStart.setHours(startHour, startMin, 0, 0);

    const lateThreshold = settings.late_threshold_minutes * 60 * 1000;
    const isLate = checkInTime.getTime() > officeStart.getTime() + lateThreshold;

    let status = isWFH ? "wfh" : "present";
    if (isLate) status = "late";

    const { data, error } = await supabase
      .from("attendance")
      .insert({
        user_id: user.id,
        date: today,
        check_in: checkInTime.toISOString(),
        status,
        latitude: isWFH ? null : latitude,
        longitude: isWFH ? null : longitude,
        device_info,
        ip_address,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      attendance: data,
      message: isLate
        ? "Checked in successfully (late arrival)"
        : "Checked in successfully",
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
}

import { createClient } from "@/lib/supabase/server";
import type { Attendance } from "@/types";

export async function getTodayAttendance(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data as Attendance | null;
}

const DEFAULT_SETTINGS: Record<string, string> = {
  office_latitude: "22.80927076763711",
  office_longitude: "86.21127374470689",
  geofence_radius: "100",
  office_start: "10:15",
  office_end: "19:30",
  standard_hours: "9",
  late_threshold_minutes: "15",
  overtime_threshold: "8",
  half_day_max: "4",
};

export async function getOfficeSettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("office_settings")
    .select("key, value");

  if (error || !data || data.length === 0) {
    return {
      office_latitude: parseFloat(DEFAULT_SETTINGS.office_latitude),
      office_longitude: parseFloat(DEFAULT_SETTINGS.office_longitude),
      geofence_radius: parseInt(DEFAULT_SETTINGS.geofence_radius),
      office_start: DEFAULT_SETTINGS.office_start,
      office_end: DEFAULT_SETTINGS.office_end,
      standard_hours: parseInt(DEFAULT_SETTINGS.standard_hours),
      late_threshold_minutes: parseInt(DEFAULT_SETTINGS.late_threshold_minutes),
      overtime_threshold: parseInt(DEFAULT_SETTINGS.overtime_threshold),
      half_day_max: parseInt(DEFAULT_SETTINGS.half_day_max),
    };
  }

  const settings: Record<string, string> = {};
  data.forEach((s) => { settings[s.key] = s.value; });

  return {
    office_latitude: parseFloat(settings.office_latitude || DEFAULT_SETTINGS.office_latitude),
    office_longitude: parseFloat(settings.office_longitude || DEFAULT_SETTINGS.office_longitude),
    geofence_radius: parseInt(settings.geofence_radius || DEFAULT_SETTINGS.geofence_radius),
    office_start: settings.office_start || DEFAULT_SETTINGS.office_start,
    office_end: settings.office_end || DEFAULT_SETTINGS.office_end,
    standard_hours: parseInt(settings.standard_hours || DEFAULT_SETTINGS.standard_hours),
    late_threshold_minutes: parseInt(settings.late_threshold_minutes || DEFAULT_SETTINGS.late_threshold_minutes),
    overtime_threshold: parseInt(settings.overtime_threshold || DEFAULT_SETTINGS.overtime_threshold),
    half_day_max: parseInt(settings.half_day_max || DEFAULT_SETTINGS.half_day_max),
  };
}

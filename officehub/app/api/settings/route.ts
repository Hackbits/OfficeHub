import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { officeSettingsSchema } from "@/lib/validations/settings";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("office_settings")
      .select("key, value");

    if (error) throw error;

    const settings: Record<string, string> = {};
    data?.forEach((s) => { settings[s.key] = s.value; });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const validatedData = officeSettingsSchema.parse(body);

    const updates = Object.entries(validatedData).map(([key, value]) =>
      supabase
        .from("office_settings")
        .upsert({ key, value: String(value), updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "key" })
    );

    await Promise.all(updates);

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

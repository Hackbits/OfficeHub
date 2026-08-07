import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createHolidaySchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["national", "company"]).default("national"),
});

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("holidays")
      .select("*")
      .order("date");

    if (error) throw error;
    return NextResponse.json({ holidays: data });
  } catch (error) {
    console.error("Get holidays error:", error);
    return NextResponse.json({ error: "Failed to get holidays" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = createHolidaySchema.parse(body);

    const { data, error } = await supabase
      .from("holidays")
      .insert({
        title: validatedData.title,
        date: validatedData.date,
        type: validatedData.type,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ holiday: data, message: "Holiday added" });
  } catch (error) {
    console.error("Create holiday error:", error);
    return NextResponse.json({ error: "Failed to create holiday" }, { status: 500 });
  }
}

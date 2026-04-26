import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get("reqId");
  if (!reqId) return NextResponse.json({ error: "reqId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("logs")
    .select("*, user:users(*)")
    .eq("requirement_id", reqId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

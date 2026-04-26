import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get("reqId");
  if (!reqId) return NextResponse.json({ error: "reqId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("comments")
    .select("*, user:users(*)")
    .eq("requirement_id", reqId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("comments")
    .insert({ requirement_id: body.requirement_id, user_id: user.id, content: body.content })
    .select("*, user:users(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

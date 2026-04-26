import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { canTransition, getPhaseFromStatus } from "@/lib/status";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params);
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("requirements")
    .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params);
  const supabase = await createServerSupabase();
  const body = await request.json();

  // If status is changing, validate transition
  if (body.status) {
    const { data: current } = await supabase
      .from("requirements")
      .select("status")
      .eq("id", id)
      .single();
    if (current && !canTransition(current.status, body.status)) {
      return NextResponse.json(
        { error: "状态不可回退" },
        { status: 400 }
      );
    }
    body.phase = getPhaseFromStatus(body.status);
  }

  const { data, error } = await supabase
    .from("requirements")
    .update(body)
    .eq("id", id)
    .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params);
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("requirements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

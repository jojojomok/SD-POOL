"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Requirement } from "@/lib/types";
import DataTable from "@/components/DataTable";
import ExportButton from "@/components/ExportButton";

export default function TablePage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
        .order("created_at", { ascending: false });
      if (data) setRequirements(data);
    };
    fetch();
  }, [supabase]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">表格视图</h1>
        <ExportButton />
      </div>
      <DataTable requirements={requirements} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Requirement } from "@/lib/types";
import DataTable from "@/components/DataTable";
import ExportButton from "@/components/ExportButton";

function getQuarterOptions(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentQ = Math.floor(month / 3) + 1;
  const options: string[] = [];
  for (let i = 0; i < 5; i++) {
    const q = currentQ + i;
    const y = year + Math.floor((q - 1) / 4);
    const qNum = ((q - 1) % 4) + 1;
    options.push(`${y}-Q${qNum}`);
  }
  return options;
}

export default function TablePage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [quarter, setQuarter] = useState("");
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

  const filtered = quarter
    ? requirements.filter((r) => r.quarter === quarter)
    : requirements;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">表格视图</h1>
        <div className="flex items-center gap-3">
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">全部季度</option>
            {getQuarterOptions().map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          <ExportButton />
        </div>
      </div>
      <DataTable requirements={filtered} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Priority, SystemOption } from "@/lib/types";

interface FilterValues {
  search?: string;
  system?: string;
  priority?: string;
  quarter?: string;
}

const systems: SystemOption[] = ["HIFOOD 1.0", "HIFOOD 2.0", "SAP", "CRM", "AI"];
const priorities: Priority[] = ["P0", "P1", "P2", "P3", "P4"];

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

export default function FilterBar({ onFilterChange }: { onFilterChange: (f: FilterValues) => void }) {
  const [search, setSearch] = useState("");
  const [system, setSystem] = useState("");
  const [priority, setPriority] = useState("");
  const [quarter, setQuarter] = useState("");

  const handleChange = () => {
    onFilterChange({
      search: search || undefined,
      system: system || undefined,
      priority: priority || undefined,
      quarter: quarter || undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
      <input
        type="text"
        placeholder="搜索需求标题..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setTimeout(handleChange, 0); }}
        className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={system}
        onChange={(e) => { setSystem(e.target.value); handleChange(); }}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">全部系统</option>
        {systems.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={priority}
        onChange={(e) => { setPriority(e.target.value); handleChange(); }}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">全部优先级</option>
        {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select
        value={quarter}
        onChange={(e) => { setQuarter(e.target.value); handleChange(); }}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">全部季度</option>
        {getQuarterOptions().map((q) => (
          <option key={q} value={q}>{q}</option>
        ))}
      </select>
    </div>
  );
}

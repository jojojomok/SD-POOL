"use client";

import { useState, useEffect } from "react";
import { Requirement, PhaseId } from "@/lib/types";
import { createClient } from "@/lib/supabase";
import KanbanColumn from "./KanbanColumn";
import FilterBar from "./FilterBar";

export default function KanbanBoard() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filtered, setFiltered] = useState<Requirement[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchRequirements = async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
        .order("created_at", { ascending: false });
      if (data) setRequirements(data);
    };
    fetchRequirements();
  }, [supabase, refreshKey]);

  useEffect(() => {
    setFiltered(requirements);
  }, [requirements]);

  const handleFilterChange = (filters: { search?: string; system?: string; priority?: string }) => {
    let result = requirements;
    if (filters.search) {
      result = result.filter((r) => r.title.includes(filters.search!));
    }
    if (filters.system) {
      result = result.filter((r) => r.system.includes(filters.system as any));
    }
    if (filters.priority) {
      result = result.filter((r) => r.priority === filters.priority);
    }
    setFiltered(result);
  };

  const phases: PhaseId[] = [1, 2, 3, 4];
  const grouped = phases.map((phase) => ({
    phase,
    items: filtered.filter((r) => r.phase === phase),
  }));

  return (
    <div>
      <FilterBar onFilterChange={handleFilterChange} />
      <div className="flex gap-4 overflow-x-auto pb-4 mt-4">
        {grouped.map(({ phase, items }) => (
          <KanbanColumn key={phase} phase={phase} requirements={items} onStatusChange={() => setRefreshKey(k => k + 1)} />
        ))}
      </div>
    </div>
  );
}

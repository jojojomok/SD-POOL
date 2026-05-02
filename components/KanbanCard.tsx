"use client";

import { useState, useEffect, useRef } from "react";
import { Requirement, RequirementStatus } from "@/lib/types";
import { STATUS_ORDER, getPhaseFromStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import SystemTags from "./SystemTags";

export default function KanbanCard({
  requirement,
  onStatusChange,
}: {
  requirement: Requirement;
  onStatusChange?: () => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const currentIndex = STATUS_ORDER.indexOf(requirement.status);
  const availableStatuses = STATUS_ORDER.slice(currentIndex).filter(
    (s) => s !== requirement.status
  );

  const handleStatusChange = async (newStatus: RequirementStatus) => {
    setIsChanging(true);
    const phase = getPhaseFromStatus(newStatus);
    const { error } = await supabase
      .from("requirements")
      .update({ status: newStatus, phase })
      .eq("id", requirement.id);

    if (error) {
      alert(error.message);
      setIsChanging(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("logs").insert({
      requirement_id: requirement.id,
      user_id: user?.id,
      action: "变更状态",
      detail: { from: requirement.status, to: newStatus },
    });

    setIsChanging(false);
    setShowDropdown(false);
    onStatusChange?.();
  };

  return (
    <div className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow relative">
      <a href={`/requirements/${requirement.id}`}>
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{requirement.title}</h3>
      </a>
      <div className="flex flex-wrap gap-1 mb-2">
        <PriorityBadge priority={requirement.priority} />
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setShowDropdown(!showDropdown); }}
            className="cursor-pointer"
            disabled={isChanging}
          >
            <StatusBadge status={requirement.status} />
          </button>
          {showDropdown && availableStatuses.length > 0 && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
              {availableStatuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleStatusChange(s); }}
                  className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <SystemTags systems={requirement.system} />
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{requirement.submitter?.name || "未知"}</span>
        {requirement.deadline && <span>截止: {requirement.deadline}</span>}
      </div>
    </div>
  );
}

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
    <div className="bg-white rounded-xl border border-[#dee2e6] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-200">
      <a href={`/requirements/${requirement.id}`} className="block no-underline">
        <h3 className="text-[15px] font-semibold text-[#0f172a] leading-snug mb-3 line-clamp-2">
          {requirement.title}
        </h3>
      </a>
      <div className="flex items-center gap-2 mb-3">
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
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#dee2e6] rounded-lg shadow-lg z-20 py-1 min-w-[130px]">
              {availableStatuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleStatusChange(s); }}
                  className="block w-full text-left px-3 py-1.5 text-[13px] text-[#495057] hover:bg-[#fff3bf]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <SystemTags systems={requirement.system} />
      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#f1f3f5] text-[12px]">
        <span className="text-[#495057]">{requirement.submitter?.name || "未知"}</span>
        {requirement.deadline && <span className="text-[#868e96]">截止: {requirement.deadline}</span>}
      </div>
    </div>
  );
}

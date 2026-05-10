"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { LogEntry } from "@/lib/types";

export default function ActivityLog({ requirementId }: { requirementId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("logs")
        .select("*, user:users(*)")
        .eq("requirement_id", requirementId)
        .order("created_at", { ascending: false });
      if (data) setLogs(data);
    };
    fetchLogs();
  }, [requirementId]);

  return (
    <div className="bg-white rounded-xl border border-[#e9ecef] p-5">
      <h3 className="text-[15px] font-bold text-[#0f172a] mb-4">活动记录</h3>
      <div className="relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#e9ecef]" />
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 relative">
              <div className="w-[24px] shrink-0 flex items-start pt-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] ring-2 ring-white relative z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#495057]">
                  <span className="font-medium text-[#0f172a]">{log.user?.name || "未知"}</span>
                  {" "}
                  <span>{log.action}</span>
                  {(log.detail as any)?.from && (log.detail as any)?.to && (
                    <span>
                      ：{(log.detail as any).from} → {(log.detail as any).to}
                    </span>
                  )}
                </p>
                <span className="text-[11px] text-[#adb5bd]">
                  {new Date(log.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-[#adb5bd] text-[13px]">暂无记录</p>}
        </div>
      </div>
    </div>
  );
}

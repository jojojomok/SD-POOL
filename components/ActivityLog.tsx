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
  }, [supabase, requirementId]);

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-4">操作记录</h3>
      <div className="border-l-2 border-gray-200 pl-4 ml-2">
        {logs.map((log) => (
          <div key={log.id} className="pb-4 relative">
            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-300" />
            <div className="text-sm text-gray-700">
              <span className="font-medium text-gray-700">{log.user?.name || "未知"}</span>
              {" "}
              <span className="text-gray-600">{log.action}</span>
              {(log.detail as any)?.from && (log.detail as any)?.to && (
                <span className="text-gray-500">
                  ：{(log.detail as any).from} → {(log.detail as any).to}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {new Date(log.created_at).toLocaleString("zh-CN")}
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-gray-400 text-sm">暂无记录</p>}
      </div>
    </div>
  );
}

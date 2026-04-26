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
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-700">{log.user?.name || "未知"}</span>
              {" "}
              <span className="text-gray-600">{log.action}</span>
              {(log.detail as any)?.from && (log.detail as any)?.to && (
                <span className="text-gray-500">
                  ：{(log.detail as any).from} → {(log.detail as any).to}
                </span>
              )}
              <div className="text-gray-400 text-xs mt-0.5">
                {new Date(log.created_at).toLocaleString("zh-CN")}
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-gray-400 text-sm">暂无记录</p>}
      </div>
    </div>
  );
}

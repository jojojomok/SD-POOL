"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Requirement } from "@/lib/types";
import { STATUS_ORDER } from "@/lib/status";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import SystemTags from "@/components/SystemTags";

const SUBMITTED_THRESHOLD = STATUS_ORDER.indexOf("待开发");

export default function QuarterPlanPage() {
  const [allReqs, setAllReqs] = useState<Requirement[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
        .order("created_at", { ascending: false });
      if (data) {
        setAllReqs(data);
        // Default to current quarter
        const now = new Date();
        const q = Math.floor(now.getMonth() / 3) + 1;
        const defaultQ = `${now.getFullYear()}-Q${q}`;
        setSelectedQuarter(defaultQ);
      }
    };
    fetch();
  }, [supabase]);

  const quarters = [...new Set(allReqs.map((r) => r.quarter).filter(Boolean))] as string[];
  const filtered = allReqs.filter((r) => r.quarter === selectedQuarter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">本季度计划</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedQuarter
              ? `${selectedQuarter} 的需求列表`
              : "请选择季度"}
          </p>
        </div>
        <select
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          {quarters.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          {selectedQuarter ? "该季度暂无需求" : "请选择一个季度查看"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">需求标题</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">所属系统</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">优先级</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">是否已提交</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">当前状态</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">负责人</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">期望完成</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const currentIdx = STATUS_ORDER.indexOf(req.status);
                const isSubmitted = currentIdx >= SUBMITTED_THRESHOLD;
                return (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors even:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <a
                        href={`/requirements/${req.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {req.title}
                      </a>
                    </td>
                    <td className="px-4 py-3"><SystemTags systems={req.system} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          isSubmitted
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isSubmitted ? "是" : "否"}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{req.assignee?.name || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{req.deadline || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

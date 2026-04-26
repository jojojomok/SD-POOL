"use client";

import { useState, useMemo } from "react";
import { Requirement } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import SystemTags from "./SystemTags";

type SortField = "title" | "priority" | "status" | "deadline" | "created_at";
type SortDir = "asc" | "desc";

export default function DataTable({ requirements }: { requirements: Requirement[] }) {
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    const filtered = requirements.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [requirements, sortField, sortDir, search]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索需求..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                { key: "title", label: "需求标题" },
                { key: "priority", label: "优先级" },
                { key: "status", label: "状态" },
                { key: null, label: "所属系统" },
                { key: "deadline", label: "期望完成" },
                { key: null, label: "负责人" },
                { key: null, label: "版本" },
                { key: "created_at", label: "创建时间" },
              ].map((col) => (
                <th
                  key={col.label}
                  className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => col.key && toggleSort(col.key as SortField)}
                >
                  {col.label}
                  {col.key === sortField && (sortDir === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((req) => (
              <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={`/requirements/${req.id}`} className="text-blue-600 hover:underline font-medium">
                    {req.title}
                  </a>
                </td>
                <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                <td className="px-4 py-3"><SystemTags systems={req.system} /></td>
                <td className="px-4 py-3 text-gray-600">{req.deadline || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{req.assignee?.name || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{req.version || "-"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(req.created_at).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="text-gray-400 text-center py-8">暂无数据</p>
        )}
      </div>
    </div>
  );
}

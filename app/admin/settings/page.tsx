"use client";

import { useState } from "react";
import { SystemOption } from "@/lib/types";

const defaultSystems: SystemOption[] = ["HIFOOD 1.0", "HIFOOD 2.0", "SAP", "CRM", "AI"];

export default function AdminSettingsPage() {
  const [systems] = useState<SystemOption[]>(defaultSystems);
  const [newSystem, setNewSystem] = useState("");

  const handleAddSystem = () => {
    alert("功能开发中 - 系统选项将存储在数据库表中（二期实现）");
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">系统配置</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-4">所属系统选项</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {systems.map((s) => (
            <span key={s} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">{s}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSystem}
            onChange={(e) => setNewSystem(e.target.value)}
            placeholder="新系统名称"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button onClick={handleAddSystem} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            添加
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { createClient } from "@/lib/supabase";

export default function ExportButton() {
  const handleExport = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("requirements")
      .select("*, submitter:users!requirements_submitter_id_fkey(name), assignee:users!requirements_assignee_id_fkey(name)");

    if (!data || data.length === 0) {
      alert("没有可导出的数据");
      return;
    }

    const headers = ["标题", "优先级", "状态", "所属系统", "所属模块", "期望完成", "负责人", "版本", "提出人", "创建时间"];
    const rows = data.map((r: any) => [
      r.title,
      r.priority,
      r.status,
      (r.system || []).join("; "),
      r.module || "",
      r.deadline || "",
      r.assignee?.name || "",
      r.version || "",
      r.submitter?.name || "",
      new Date(r.created_at).toLocaleDateString("zh-CN"),
    ]);

    const csv = [headers.join(","), ...rows.map((r: string[]) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `需求列表_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg text-[13px] hover:bg-[#d97706] transition-colors"
    >
      导出 CSV
    </button>
  );
}

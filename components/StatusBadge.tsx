const statusStyles: Record<string, { dot: string; bg: string; text: string }> = {
  "待跟进":     { dot: "#adb5bd", bg: "#f8f9fa", text: "#495057" },
  "跟进中":     { dot: "#f59e0b", bg: "#fff3bf", text: "#92400e" },
  "待审批":     { dot: "#3b82f6", bg: "#dbe4ff", text: "#364fc7" },
  "待用户确认": { dot: "#f59e0b", bg: "#fff3bf", text: "#92400e" },
  "开发评审":   { dot: "#3b82f6", bg: "#dbe4ff", text: "#364fc7" },
  "报价中":     { dot: "#f59e0b", bg: "#fff3bf", text: "#92400e" },
  "待确认华定币": { dot: "#f59e0b", bg: "#fff3bf", text: "#92400e" },
  "待开发":     { dot: "#3b82f6", bg: "#dbe4ff", text: "#364fc7" },
  "开发中":     { dot: "#3b82f6", bg: "#dbe4ff", text: "#364fc7" },
  "测试中":     { dot: "#3b82f6", bg: "#dbe4ff", text: "#364fc7" },
  "用户验收":   { dot: "#7950f2", bg: "#f3d9fa", text: "#862e9c" },
  "待发布":     { dot: "#12b886", bg: "#d3f9d8", text: "#2b8a3e" },
  "已上线":     { dot: "#12b886", bg: "#d3f9d8", text: "#2b8a3e" },
};

import type { RequirementStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: RequirementStatus }) {
  const style = statusStyles[status] ?? statusStyles["待跟进"];
  return (
    <span
      className="inline-flex items-center gap-[5px] px-[10px] py-[2px] rounded-full text-[11px] font-medium"
      style={{ background: style.bg, color: style.text, border: `1px solid ${style.bg}` }}
    >
      <span className="w-[5px] h-[5px] rounded-full" style={{ background: style.dot }} />
      {status}
    </span>
  );
}

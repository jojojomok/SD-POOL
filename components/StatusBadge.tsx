import { RequirementStatus } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  "待跟进": "bg-gray-100 text-gray-600",
  "跟进中": "bg-blue-100 text-blue-700",
  "待审批": "bg-yellow-100 text-yellow-700",
  "待用户确认": "bg-orange-100 text-orange-700",
  "开发评审": "bg-purple-100 text-purple-700",
  "报价中": "bg-pink-100 text-pink-700",
  "待确认华定币": "bg-rose-100 text-rose-700",
  "待开发": "bg-cyan-100 text-cyan-700",
  "开发中": "bg-indigo-100 text-indigo-700",
  "测试中": "bg-violet-100 text-violet-700",
  "用户验收": "bg-teal-100 text-teal-700",
  "待发布": "bg-emerald-100 text-emerald-700",
  "已上线": "bg-green-100 text-green-700",
};

export default function StatusBadge({ status }: { status: RequirementStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

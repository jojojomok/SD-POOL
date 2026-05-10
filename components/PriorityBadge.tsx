import { Priority } from "@/lib/types";

const priorityStyles: Record<Priority, string> = {
  P0: "bg-[#fa5252] text-white font-bold",
  P1: "bg-[#f59e0b] text-white font-bold",
  P2: "bg-[#3b82f6] text-white font-bold",
  P3: "bg-[#e9ecef] text-[#868e96]",
  P4: "bg-[#f1f3f5] text-[#adb5bd]",
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center px-[6px] py-[1px] rounded text-[11px] leading-5 font-bold ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}

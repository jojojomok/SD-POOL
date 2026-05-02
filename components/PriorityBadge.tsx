import { Priority } from "@/lib/types";

const colors: Record<Priority, string> = {
  P0: "bg-red-100 text-red-700",
  P1: "bg-orange-100 text-orange-700",
  P2: "bg-blue-100 text-blue-700",
  P3: "bg-gray-100 text-gray-600",
  P4: "bg-gray-50 text-gray-400",
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${colors[priority]}`}>
      {priority}
    </span>
  );
}

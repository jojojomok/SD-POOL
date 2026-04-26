import { Priority } from "@/lib/types";

const colors: Record<Priority, string> = {
  P0: "bg-red-100 text-red-800",
  P1: "bg-orange-100 text-orange-800",
  P2: "bg-blue-100 text-blue-800",
  P3: "bg-gray-100 text-gray-600",
  P4: "bg-gray-100 text-gray-400",
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[priority]}`}>
      {priority}
    </span>
  );
}

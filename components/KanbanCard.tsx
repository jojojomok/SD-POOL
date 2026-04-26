import { Requirement } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import SystemTags from "./SystemTags";

export default function KanbanCard({ requirement }: { requirement: Requirement }) {
  return (
    <a
      href={`/requirements/${requirement.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{requirement.title}</h3>
      <div className="flex flex-wrap gap-1 mb-2">
        <PriorityBadge priority={requirement.priority} />
        <StatusBadge status={requirement.status} />
      </div>
      <SystemTags systems={requirement.system} />
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{requirement.submitter?.name || "未知"}</span>
        {requirement.deadline && <span>截止: {requirement.deadline}</span>}
      </div>
    </a>
  );
}

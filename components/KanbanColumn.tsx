import { Requirement, PhaseId } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/status";
import KanbanCard from "./KanbanCard";

interface Props {
  phase: PhaseId;
  requirements: Requirement[];
  onStatusChange?: () => void;
}

const bgColors: Record<PhaseId, string> = {
  1: "bg-gray-50",
  2: "bg-yellow-50",
  3: "bg-blue-50",
  4: "bg-green-50",
};

const headerColors: Record<PhaseId, string> = {
  1: "bg-gray-200 text-gray-800",
  2: "bg-yellow-200 text-yellow-800",
  3: "bg-blue-200 text-blue-800",
  4: "bg-green-200 text-green-800",
};

export default function KanbanColumn({ phase, requirements, onStatusChange }: Props) {
  return (
    <div className={`flex-shrink-0 w-72 rounded-xl ${bgColors[phase]} p-3`}>
      <div className={`rounded-lg px-3 py-2 mb-3 font-medium text-sm ${headerColors[phase]}`}>
        {PHASE_LABELS[phase]}
        <span className="ml-2 text-xs opacity-70">({requirements.length})</span>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {requirements.map((req) => (
          <KanbanCard key={req.id} requirement={req} onStatusChange={onStatusChange} />
        ))}
        {requirements.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">暂无需求</p>
        )}
      </div>
    </div>
  );
}

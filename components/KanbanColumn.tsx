import { Requirement, PhaseId } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/status";
import KanbanCard from "./KanbanCard";

interface Props {
  phase: PhaseId;
  requirements: Requirement[];
  onStatusChange?: () => void;
}

const phaseStyles: Record<PhaseId, { bg: string; dot: string }> = {
  1: { bg: "bg-[#f8f9fa]", dot: "#adb5bd" },
  2: { bg: "bg-[#fffbeb]", dot: "#f59e0b" },
  3: { bg: "bg-[#f0f5ff]", dot: "#3b82f6" },
  4: { bg: "bg-[#f0faf5]", dot: "#12b886" },
};

export default function KanbanColumn({ phase, requirements, onStatusChange }: Props) {
  const style = phaseStyles[phase];

  return (
    <div className={`w-80 shrink-0 rounded-xl ${style.bg} p-4`}>
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-2 h-2 rounded-full" style={{ background: style.dot }} />
        <h2 className="text-[15px] font-bold text-[#0f172a]">{PHASE_LABELS[phase]}</h2>
        <span className="ml-auto text-[12px] text-[#868e96] bg-white px-2 py-0.5 rounded-full border border-[#e9ecef]">
          {requirements.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 min-h-[200px]">
        {requirements.map((req) => (
          <KanbanCard key={req.id} requirement={req} onStatusChange={onStatusChange} />
        ))}
        {requirements.length === 0 && (
          <p className="text-[#adb5bd] text-[13px] text-center py-8">暫無需求</p>
        )}
      </div>
    </div>
  );
}

import { RequirementStatus } from "@/lib/types";
import { PHASE_STATUS_MAP, PhaseId } from "@/lib/status";

const phaseColors: Record<PhaseId, string> = {
  1: "bg-gray-100 text-gray-800",
  2: "bg-yellow-100 text-yellow-800",
  3: "bg-blue-100 text-blue-800",
  4: "bg-green-100 text-green-800",
};

function getPhaseForStatus(status: RequirementStatus): PhaseId {
  for (const [phase, statuses] of Object.entries(PHASE_STATUS_MAP)) {
    if (statuses.includes(status)) return Number(phase) as PhaseId;
  }
  return 1;
}

export default function StatusBadge({ status }: { status: RequirementStatus }) {
  const phase = getPhaseForStatus(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${phaseColors[phase]}`}>
      {status}
    </span>
  );
}

import { RequirementStatus, PhaseId } from "./types";

export const STATUS_ORDER: RequirementStatus[] = [
  "待跟进",
  "跟进中",
  "待审批",
  "待用户确认",
  "开发评审",
  "报价中",
  "待确认华定币",
  "待开发",
  "开发中",
  "测试中",
  "用户验收",
  "待发布",
  "已上线",
];

export const PHASE_STATUS_MAP: Record<PhaseId, RequirementStatus[]> = {
  1: ["待跟进", "跟进中"],
  2: ["待审批", "待用户确认", "开发评审", "报价中", "待确认华定币"],
  3: ["待开发", "开发中", "测试中"],
  4: ["用户验收", "待发布", "已上线"],
};

export const PHASE_LABELS: Record<PhaseId, string> = {
  1: "需求提出 - PM跟进",
  2: "评审 & 报价",
  3: "开发 & 测试",
  4: "验收 & 上线",
};

export function getPhaseFromStatus(status: RequirementStatus): PhaseId {
  for (const [phase, statuses] of Object.entries(PHASE_STATUS_MAP)) {
    if (statuses.includes(status)) return Number(phase) as PhaseId;
  }
  return 1;
}

export function canTransition(
  from: RequirementStatus,
  to: RequirementStatus
): boolean {
  const fromIndex = STATUS_ORDER.indexOf(from);
  const toIndex = STATUS_ORDER.indexOf(to);
  // Forward only: must stay same or move forward, cannot go backward
  return toIndex >= fromIndex;
}

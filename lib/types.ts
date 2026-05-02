export type Role = "pm" | "boss" | "stakeholder";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
}

export type SystemOption = "HIFOOD 1.0" | "HIFOOD 2.0" | "SAP" | "CRM" | "AI";

export type Priority = "P0" | "P1" | "P2" | "P3" | "P4";

export type RequirementStatus =
  | "待跟进"
  | "跟进中"
  | "待审批"
  | "待用户确认"
  | "开发评审"
  | "报价中"
  | "待确认华定币"
  | "待开发"
  | "开发中"
  | "测试中"
  | "用户验收"
  | "待发布"
  | "已上线";

export type PhaseId = 1 | 2 | 3 | 4;

export interface Requirement {
  id: string;
  title: string;
  brief?: string;
  description?: string;
  prd_url?: string;
  mockup_url?: string;
  submitter_id: string;
  system: SystemOption[];
  module?: string;
  priority: Priority;
  deadline?: string;
  estimate?: number;
  assignee_id?: string;
  version?: string;
  quarter?: string;
  status: RequirementStatus;
  phase: PhaseId;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  submitter?: User;
  assignee?: User;
}

export interface Comment {
  id: string;
  requirement_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface LogEntry {
  id: string;
  requirement_id: string;
  user_id: string;
  action: string;
  detail: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export interface CreateRequirementInput {
  title: string;
  brief?: string;
  description?: string;
  prd_url?: string;
  mockup_url?: string;
  system: SystemOption[];
  module?: string;
  priority: Priority;
  deadline?: string;
  estimate?: number;
  version?: string;
  quarter?: string;
  attachments?: string[];
}

export interface UpdateRequirementInput extends Partial<CreateRequirementInput> {
  assignee_id?: string;
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Requirement as ReqType } from "@/lib/types";
import { STATUS_ORDER, canTransition, getPhaseFromStatus } from "@/lib/status";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CommentSection from "@/components/CommentSection";
import ActivityLog from "@/components/ActivityLog";

export default function RequirementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [req, setReq] = useState<ReqType | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
        .eq("id", id)
        .single();
      if (data) setReq(data);
    };
    fetch();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("users").select("*").eq("id", data.user.id).single().then(
          ({ data: u }) => setCurrentUser(u)
        );
      }
    });
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!req || !canTransition(req.status, newStatus as any)) {
      alert("状态不可回退");
      return;
    }
    const phase = getPhaseFromStatus(newStatus as any);
    const { error } = await supabase
      .from("requirements")
      .update({ status: newStatus, phase })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("logs").insert({
      requirement_id: id,
      user_id: user?.id,
      action: "变更状态",
      detail: { from: req.status, to: newStatus },
    });

    const { data } = await supabase
      .from("requirements")
      .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
      .eq("id", id)
      .single();
    if (data) setReq(data);
  };

  const handleDelete = async () => {
    if (!confirm("确认删除此需求？此操作不可撤销。")) return;
    const { error } = await supabase
      .from("requirements")
      .delete()
      .eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  };

  if (!req) return (
    <div className="flex items-center justify-center py-16">
      <div className="text-[#868e96] text-[14px]">加载中...</div>
    </div>
  );

  const currentIndex = STATUS_ORDER.indexOf(req.status);
  const canEdit = currentUser?.role === "pm" || currentUser?.role === "boss";

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="text-[13px] text-[#868e96] hover:text-[#495057] mb-4 transition-colors">
        ← 返回
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <PriorityBadge priority={req.priority} />
        <StatusBadge status={req.status} />
        {canEdit && (
          <div className="ml-auto flex gap-2">
            <a
              href={`/requirements/${id}/edit`}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-white text-[#495057] border border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors"
            >
              编辑
            </a>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-[#fff5f5] text-[#fa5252] border border-[#ffe0e0] hover:bg-[#ffe0e0] transition-colors"
            >
              删除
            </button>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold text-[#0f172a] mb-2">{req.title}</h1>

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-[#868e96] mb-6">
        <span>提出人：{req.submitter?.name || "未知"}</span>
        <span>所属系统：{req.system.join(", ")}</span>
        {req.module && <span>模块：{req.module}</span>}
        {req.deadline && <span>期望完成：{req.deadline}</span>}
        {req.assignee && <span>负责人：{req.assignee.name}</span>}
        {req.version && <span>版本：{req.version}</span>}
        {req.estimate && <span>预估工时/报价：{req.estimate}</span>}
      </div>

      {/* Status change for PM/boss */}
      {canEdit && (
        <div className="mb-6 p-4 bg-[#fffbeb] rounded-xl border border-[#fde68a]">
          <label className="block text-[13px] font-medium text-[#92400e] mb-2">变更状态</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_ORDER.slice(currentIndex).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={s === req.status}
                className={`px-3 py-1.5 rounded-lg text-[13px] border transition-colors ${
                  s === req.status
                    ? "bg-[#f59e0b] text-white border-[#f59e0b]"
                    : "bg-white text-[#495057] border-[#dee2e6] hover:bg-[#fffbeb]"
                } disabled:opacity-50`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left column: content */}
        <div className="flex-[2] min-w-0 space-y-6">
          {req.brief && (
            <div className="bg-[#f8f9fa] rounded-xl p-5 border border-[#e9ecef]">
              <h3 className="text-[11px] font-semibold text-[#868e96] uppercase tracking-wider mb-2">Brief</h3>
              <p className="text-[14px] leading-relaxed text-[#212529]">{req.brief}</p>
            </div>
          )}

          {req.description && (
            <div className="bg-[#f8f9fa] rounded-xl p-5 border border-[#e9ecef]">
              <h3 className="text-[11px] font-semibold text-[#868e96] uppercase tracking-wider mb-2">需求描述</h3>
              <p className="text-[14px] leading-relaxed text-[#212529] whitespace-pre-wrap">{req.description}</p>
            </div>
          )}

          <div className="flex gap-3 text-[13px]">
            {req.prd_url && (
              <a href={req.prd_url} target="_blank" rel="noopener noreferrer" className="text-[#d97706] hover:text-[#b45309] transition-colors">
                查看 PRD →
              </a>
            )}
            {req.mockup_url && (
              <a href={req.mockup_url} target="_blank" rel="noopener noreferrer" className="text-[#d97706] hover:text-[#b45309] transition-colors">
                查看墨刀原型 →
              </a>
            )}
          </div>

          {/* Comment section */}
          <div className="bg-white rounded-xl border border-[#e9ecef] p-5">
            <CommentSection requirementId={id} />
          </div>
        </div>

        {/* Right column: sidebar */}
        <div className="flex-1 space-y-4">
          <div className="bg-[#f8f9fa] rounded-xl p-5 border border-[#e9ecef] sticky top-24">
            <h3 className="text-[11px] font-semibold text-[#868e96] uppercase tracking-wider mb-4">详细信息</h3>
            <div className="space-y-3 text-[13px]">
              <div><span className="text-[#868e96]">状态：</span><span className="text-[#495057]">{req.status}</span></div>
              <div><span className="text-[#868e96]">优先级：</span><span className="text-[#495057]">{req.priority}</span></div>
              <div><span className="text-[#868e96]">提出人：</span><span className="text-[#495057]">{req.submitter?.name || "未知"}</span></div>
              <div><span className="text-[#868e96]">负责人：</span><span className="text-[#495057]">{req.assignee?.name || "-"}</span></div>
              {req.quarter && <div><span className="text-[#868e96]">季度：</span><span className="text-[#495057]">{req.quarter}</span></div>}
              {req.deadline && <div><span className="text-[#868e96]">期望完成：</span><span className="text-[#495057]">{req.deadline}</span></div>}
              {req.estimate && <div><span className="text-[#868e96]">预估工时：</span><span className="text-[#495057]">{req.estimate}</span></div>}
              <div><span className="text-[#868e96]">创建时间：</span><span className="text-[#495057]">{new Date(req.created_at).toLocaleDateString("zh-CN")}</span></div>
            </div>
          </div>
          <ActivityLog requirementId={id} />
        </div>
      </div>
    </div>
  );
}

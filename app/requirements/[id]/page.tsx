"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Requirement as ReqType } from "@/lib/types";
import { STATUS_ORDER, canTransition, getPhaseFromStatus } from "@/lib/status";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import SystemTags from "@/components/SystemTags";
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
  }, [supabase, id]);

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

    // Log the status change
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("logs").insert({
      requirement_id: id,
      user_id: user?.id,
      action: "变更状态",
      detail: { from: req.status, to: newStatus },
    });

    // Refresh
    const { data } = await supabase
      .from("requirements")
      .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
      .eq("id", id)
      .single();
    if (data) setReq(data);
  };

  if (!req) return <div className="text-center py-12 text-gray-500">加载中...</div>;

  const currentIndex = STATUS_ORDER.indexOf(req.status);
  const canEdit = currentUser?.role === "pm" || currentUser?.role === "boss";

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 返回
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{req.title}</h1>
          <div className="flex gap-2">
            <PriorityBadge priority={req.priority} />
            <StatusBadge status={req.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div><span className="text-gray-500">提出人：</span>{req.submitter?.name || "未知"}</div>
          <div><span className="text-gray-500">所属系统：</span><SystemTags systems={req.system} /></div>
          {req.module && <div><span className="text-gray-500">模块：</span>{req.module}</div>}
          {req.deadline && <div><span className="text-gray-500">期望完成：</span>{req.deadline}</div>}
          {req.assignee && <div><span className="text-gray-500">负责人：</span>{req.assignee.name}</div>}
          {req.version && <div><span className="text-gray-500">版本：</span>{req.version}</div>}
          {req.estimate && <div><span className="text-gray-500">预估工时/报价：</span>{req.estimate}</div>}
        </div>

        {canEdit && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">变更状态</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.slice(currentIndex).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={s === req.status}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    s === req.status
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  } disabled:opacity-50`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {req.brief && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-1">Brief</h3>
            <p className="text-gray-600">{req.brief}</p>
          </div>
        )}

        {req.description && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-1">需求描述</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{req.description}</p>
          </div>
        )}

        <div className="flex gap-4 text-sm">
          {req.prd_url && (
            <a href={req.prd_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">查看 PRD →</a>
          )}
          {req.mockup_url && (
            <a href={req.mockup_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">查看墨刀原型 →</a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <CommentSection requirementId={id} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <ActivityLog requirementId={id} />
        </div>
      </div>
    </div>
  );
}

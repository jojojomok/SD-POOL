"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Comment } from "@/lib/types";

export default function CommentSection({ requirementId }: { requirementId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*, user:users(*)")
        .eq("requirement_id", requirementId)
        .order("created_at", { ascending: true });
      if (data) setComments(data);
    };
    fetchComments();
  }, [requirementId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("comments").insert({
      requirement_id: requirementId,
      user_id: user.id,
      content: content.trim(),
    });
    setContent("");
    const { data } = await supabase
      .from("comments")
      .select("*, user:users(*)")
      .eq("requirement_id", requirementId)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
  };

  return (
    <div>
      <h3 className="text-[15px] font-bold text-[#0f172a] mb-4">
        评论 ({comments.length})
      </h3>
      <div className="space-y-4 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f1f3f5] flex items-center justify-center text-[12px] font-bold text-[#495057] shrink-0">
              {c.user?.name?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-medium text-[#0f172a]">{c.user?.name || "未知"}</span>
                <span className="text-[11px] text-[#adb5bd]">
                  {new Date(c.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
              <p className="text-[13px] text-[#495057] leading-relaxed">{c.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-[#adb5bd] text-[13px]">暂无评论</p>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="添加评论..."
          className="flex-1 px-4 py-2 border border-[#dee2e6] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-[#f59e0b]"
        />
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-white text-[13px] font-medium transition-colors">
          发送
        </button>
      </form>
    </div>
  );
}

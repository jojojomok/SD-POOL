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
  }, [supabase, requirementId]);

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
    // Refresh
    const { data } = await supabase
      .from("comments")
      .select("*, user:users(*)")
      .eq("requirement_id", requirementId)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
  };

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-4">评论 ({comments.length})</h3>
      <div className="space-y-4 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-gray-900">{c.user?.name || "未知"}</span>
              <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString("zh-CN")}</span>
            </div>
            <p className="text-gray-800">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-gray-400 text-sm">暂无评论</p>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="添加评论..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          发送
        </button>
      </form>
    </div>
  );
}

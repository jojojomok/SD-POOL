"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Requirement } from "@/lib/types";
import RequirementForm from "@/components/RequirementForm";

export default function EditRequirementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [req, setReq] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setReq(data);
      setLoading(false);
    };
    fetch();
  }, [supabase, id]);

  if (loading) return <div className="text-center py-12 text-gray-500">加载中...</div>;
  if (!req) return <div className="text-center py-12 text-gray-500">需求不存在</div>;

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 返回
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">编辑需求</h1>
      <RequirementForm isEdit initialData={req} />
    </div>
  );
}

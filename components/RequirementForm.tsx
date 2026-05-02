"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { CreateRequirementInput, Priority, SystemOption, Requirement } from "@/lib/types";

const systems: SystemOption[] = ["HIFOOD 1.0", "HIFOOD 2.0", "SAP", "CRM", "AI"];
const priorities: Priority[] = ["P0", "P1", "P2", "P3", "P4"];

interface Props {
  initialData?: Requirement;
  isEdit?: boolean;
}

export default function RequirementForm({ initialData, isEdit }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateRequirementInput>({
    title: initialData?.title || "",
    brief: initialData?.brief || "",
    description: initialData?.description || "",
    prd_url: initialData?.prd_url || "",
    mockup_url: initialData?.mockup_url || "",
    system: initialData?.system || [],
    module: initialData?.module || "",
    priority: initialData?.priority || "P2",
    deadline: initialData?.deadline || "",
    estimate: initialData?.estimate || undefined,
    version: initialData?.version || "",
  });

  const toggleSystem = (sys: SystemOption) => {
    setForm((prev) => ({
      ...prev,
      system: prev.system.includes(sys)
        ? prev.system.filter((s) => s !== sys)
        : [...prev.system, sys],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.title.trim()) {
      setError("请输入需求标题");
      setSubmitting(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("未登录");
      setSubmitting(false);
      return;
    }

    if (isEdit && initialData) {
      const { error: err } = await supabase
        .from("requirements")
        .update(form)
        .eq("id", initialData.id);
      if (err) { setError(err.message); setSubmitting(false); return; }
      router.push(`/requirements/${initialData.id}`);
      router.refresh();
      return;
    } else {
      const { error: err } = await supabase
        .from("requirements")
        .insert({ ...form, submitter_id: user.id });
      if (err) { setError(err.message); setSubmitting(false); return; }
    }

    if (!isEdit) {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">需求标题 *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">所属系统 *</label>
        <div className="flex flex-wrap gap-2">
          {systems.map((sys) => (
            <button
              key={sys}
              type="button"
              onClick={() => toggleSystem(sys)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                form.system.includes(sys)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {sys}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">期望完成时间</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">需求 Brief</label>
        <input
          type="text"
          value={form.brief}
          onChange={(e) => setForm({ ...form, brief: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">需求描述</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PRD 链接</label>
          <input
            type="url"
            value={form.prd_url}
            onChange={(e) => setForm({ ...form, prd_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">墨刀链接</label>
          <input
            type="url"
            value={form.mockup_url}
            onChange={(e) => setForm({ ...form, mockup_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">所属模块</label>
          <input
            type="text"
            value={form.module}
            onChange={(e) => setForm({ ...form, module: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">所属迭代/版本</label>
          <input
            type="text"
            value={form.version}
            onChange={(e) => setForm({ ...form, version: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="v2.3"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">预估工时/报价</label>
        <input
          type="number"
          value={form.estimate || ""}
          onChange={(e) => setForm({ ...form, estimate: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          placeholder="人天或金额"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {submitting ? "提交中..." : isEdit ? "保存修改" : "提交需求"}
      </button>
    </form>
  );
}

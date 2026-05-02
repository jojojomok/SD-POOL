"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User, Role } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("stakeholder");
  const [password, setPassword] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.from("users").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setUsers(data);
    });
  }, [supabase]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError || !authData.user) {
      alert(authError?.message || "创建失败");
      return;
    }
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      name,
      email,
      role,
    });
    if (profileError) {
      alert(profileError.message);
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">用户管理</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-medium text-gray-900 mb-4">添加用户</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <input
            placeholder="姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="初始密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="stakeholder">需求方</option>
            <option value="pm">PM</option>
            <option value="boss">上级</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors">
          添加
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">姓名</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">邮箱</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">角色</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors even:bg-gray-50/50">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  {u.role === "pm" ? "PM" : u.role === "boss" ? "上级" : "需求方"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

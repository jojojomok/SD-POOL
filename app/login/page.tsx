"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl border border-[#e9ecef] w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">需求管理平台</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-[#dee2e6] rounded-lg focus:ring-2 focus:ring-[#f59e0b] focus:border-[#f59e0b] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-[#dee2e6] rounded-lg focus:ring-2 focus:ring-[#f59e0b] focus:border-[#f59e0b] outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#f59e0b] text-white py-2.5 rounded-lg hover:bg-[#d97706] active:bg-[#b45309] transition-colors font-medium"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}

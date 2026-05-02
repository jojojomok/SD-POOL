"use client";

import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { User } from "@/lib/types";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setUser(data);
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!user || pathname === "/login") return null;

  const isAdmin = user.role === "pm" || user.role === "boss";
  const navLinks = [
    { href: "/", label: "看板" },
    { href: "/quarter-plan", label: "本季度计划" },
    { href: "/table", label: "表格" },
    { href: "/requirements/new", label: "+ 新建需求" },
    ...(isAdmin ? [{ href: "/admin", label: "后台管理" }] : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg text-gray-900">需求管理</span>
          <div className="flex gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm ${
                  pathname === link.href
                    ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-0.5"
                    : "text-gray-600 hover:text-gray-900 transition-colors"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {user.name} ({user.role === "pm" ? "PM" : user.role === "boss" ? "上级" : "需求方"})
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            退出
          </button>
        </div>
      </div>
    </nav>
  );
}

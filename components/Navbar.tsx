"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "看板" },
  { href: "/quarter-plan", label: "本季度計劃" },
  { href: "/table", label: "表格" },
  { href: "/requirements/new", label: "+ 新建需求" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setRole(profile.role);
          });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!user || pathname === "/login") return null;

  const roleLabel: Record<string, string> = { pm: "PM", boss: "上級", stakeholder: "需" };
  const roleInitial = roleLabel[role] || "?";

  return (
    <nav className="h-14 bg-white border-b border-[#e9ecef]">
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center gap-8">
        <Link href="/" className="font-bold text-[16px] text-[#0f172a] shrink-0">
          需求管理
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-[6px] rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#fffbeb] text-[#d97706]"
                    : "text-[#495057] hover:text-[#0f172a] hover:bg-[#f1f3f5]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        {(role === "pm" || role === "boss") && (
          <Link
            href="/admin"
            className={`px-3.5 py-[6px] rounded-lg text-[13px] font-medium transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-[#fffbeb] text-[#d97706]"
                : "text-[#495057] hover:text-[#0f172a] hover:bg-[#f1f3f5]"
            }`}
          >
            後台管理
          </Link>
        )}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="text-[12px] text-[#adb5bd] hover:text-[#495057] transition-colors"
          >
            退出
          </button>
          <span className="text-[13px] text-[#495057]">
            {user.email?.split("@")[0]}
          </span>
          <div
            className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center text-white text-[12px] font-bold cursor-default"
            title={role === "pm" ? "PM" : role === "boss" ? "上級" : "需求方"}
          >
            {roleInitial}
          </div>
        </div>
      </div>
    </nav>
  );
}

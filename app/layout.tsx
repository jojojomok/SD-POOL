import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "需求管理平台",
  description: "产品经理需求生命周期管理工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-8 py-8">{children}</main>
      </body>
    </html>
  );
}

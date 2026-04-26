import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">后台管理</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
          <h2 className="font-medium text-gray-900 mb-1">用户管理</h2>
          <p className="text-sm text-gray-500">添加、编辑、删除用户</p>
        </Link>
        <Link href="/admin/settings" className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
          <h2 className="font-medium text-gray-900 mb-1">系统配置</h2>
          <p className="text-sm text-gray-500">管理系统/模块选项</p>
        </Link>
      </div>
    </div>
  );
}

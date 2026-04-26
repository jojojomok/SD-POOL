# PM 需求管理工具 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-user web app for PM, superiors, and stakeholders to collaboratively manage requirement lifecycle

**Architecture:** Next.js 14 (App Router) full-stack app with Supabase (PostgreSQL + Auth), deployed on Vercel. Tailwind CSS for UI. Kanban-board layout with drag-free status transitions, plus table view and Excel export.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (DB + Auth), Vercel, exceljs (export)

**Spec:** `docs/superpowers/specs/2026-04-26-pm-requirement-management-tool-design.md`

---

## File Structure

```
├── app/
│   ├── layout.tsx                    # Root layout (Navbar + AuthGuard)
│   ├── page.tsx                      # Kanban board (home page)
│   ├── globals.css                   # Tailwind imports + custom styles
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── requirements/
│   │   ├── new/
│   │   │   └── page.tsx             # Submit new requirement
│   │   └── [id]/
│   │       └── page.tsx             # Requirement detail + comments + logs
│   ├── table/
│   │   └── page.tsx                 # Table view with export
│   ├── admin/
│   │   ├── page.tsx                 # Admin dashboard
│   │   ├── users/
│   │   │   └── page.tsx             # User management
│   │   └── settings/
│   │       └── page.tsx             # System/module config
│   └── api/
│       ├── requirements/
│       │   ├── route.ts             # GET (list+filter) / POST (create)
│       │   ├── [id]/
│       │   │   └── route.ts         # GET / PUT / DELETE
│       │   └── export/
│       │       └── route.ts         # GET → Excel download
│       └── users/
│           └── route.ts             # GET / POST / PUT (admin)
├── components/
│   ├── KanbanBoard.tsx              # 4-column board layout
│   ├── KanbanColumn.tsx             # Single phase column
│   ├── KanbanCard.tsx               # Requirement card
│   ├── RequirementForm.tsx          # Create/edit form (shared)
│   ├── CommentSection.tsx           # Comments list + input
│   ├── ActivityLog.tsx              # Operation timeline
│   ├── StatusBadge.tsx              # Colored status label
│   ├── PriorityBadge.tsx            # P0-P4 label
│   ├── SystemTags.tsx               # Multi-select system tags
│   ├── FilterBar.tsx                # Search + filters
│   ├── DataTable.tsx                # Table view with sort
│   ├── ExportButton.tsx             # Triggers Excel download
│   ├── Navbar.tsx                   # Top nav with user menu
│   └── AuthGuard.tsx                # Route protection wrapper
├── lib/
│   ├── supabase.ts                  # Browser Supabase client
│   ├── supabase-server.ts           # Server Supabase client
│   ├── status.ts                    # Status/phase mappings + validation
│   └── types.ts                     # Shared TypeScript types
├── middleware.ts                    # Auth redirect middleware
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

### Task 1: Initialize Next.js project and install dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `app/globals.css`

- [ ] **Step 1: Scaffold Next.js project**

Run:
```bash
cd /Users/jomok/vscode/1st
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

- [ ] **Step 2: Install additional dependencies**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr exceljs
npm install -D @types/node
```

- [ ] **Step 3: Update `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Update `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --phase-1-bg: #f3f4f6;
    --phase-2-bg: #fef3c7;
    --phase-3-bg: #dbeafe;
    --phase-4-bg: #d1fae5;
  }
}
```

- [ ] **Step 5: Create `next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
```

- [ ] **Step 6: Initial commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js project with Tailwind and Supabase deps"
```

---

### Task 2: Define TypeScript types and status mappings

**Files:**
- Create: `lib/types.ts`
- Create: `lib/status.ts`

- [ ] **Step 1: Create `lib/types.ts` with all shared types**

```typescript
export type Role = "pm" | "boss" | "stakeholder";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
}

export type SystemOption = "HIFOOD 1.0" | "HIFOOD 2.0" | "SAP" | "CRM" | "AI";

export type Priority = "P0" | "P1" | "P2" | "P3" | "P4";

export type RequirementStatus =
  | "待跟进"
  | "跟进中"
  | "待审批"
  | "待用户确认"
  | "开发评审"
  | "报价中"
  | "待确认华定币"
  | "待开发"
  | "开发中"
  | "测试中"
  | "用户验收"
  | "待发布"
  | "已上线";

export type PhaseId = 1 | 2 | 3 | 4;

export interface Requirement {
  id: string;
  title: string;
  brief?: string;
  description?: string;
  prd_url?: string;
  mockup_url?: string;
  submitter_id: string;
  system: SystemOption[];
  module?: string;
  priority: Priority;
  deadline?: string;
  estimate?: number;
  assignee_id?: string;
  version?: string;
  status: RequirementStatus;
  phase: PhaseId;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  submitter?: User;
  assignee?: User;
}

export interface Comment {
  id: string;
  requirement_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface LogEntry {
  id: string;
  requirement_id: string;
  user_id: string;
  action: string;
  detail: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export interface CreateRequirementInput {
  title: string;
  brief?: string;
  description?: string;
  prd_url?: string;
  mockup_url?: string;
  system: SystemOption[];
  module?: string;
  priority: Priority;
  deadline?: string;
  estimate?: number;
  version?: string;
  attachments?: string[];
}

export interface UpdateRequirementInput extends Partial<CreateRequirementInput> {
  assignee_id?: string;
}
```

- [ ] **Step 2: Create `lib/status.ts` with status/phase mappings and transition validation**

```typescript
import { RequirementStatus, PhaseId } from "./types";

export const STATUS_ORDER: RequirementStatus[] = [
  "待跟进",
  "跟进中",
  "待审批",
  "待用户确认",
  "开发评审",
  "报价中",
  "待确认华定币",
  "待开发",
  "开发中",
  "测试中",
  "用户验收",
  "待发布",
  "已上线",
];

export const PHASE_STATUS_MAP: Record<PhaseId, RequirementStatus[]> = {
  1: ["待跟进", "跟进中"],
  2: ["待审批", "待用户确认", "开发评审", "报价中", "待确认华定币"],
  3: ["待开发", "开发中", "测试中"],
  4: ["用户验收", "待发布", "已上线"],
};

export const PHASE_LABELS: Record<PhaseId, string> = {
  1: "需求提出 - PM跟进",
  2: "评审 & 报价",
  3: "开发 & 测试",
  4: "验收 & 上线",
};

export function getPhaseFromStatus(status: RequirementStatus): PhaseId {
  for (const [phase, statuses] of Object.entries(PHASE_STATUS_MAP)) {
    if (statuses.includes(status)) return Number(phase) as PhaseId;
  }
  return 1;
}

export function canTransition(
  from: RequirementStatus,
  to: RequirementStatus
): boolean {
  const fromIndex = STATUS_ORDER.indexOf(from);
  const toIndex = STATUS_ORDER.indexOf(to);
  // Forward only: must stay same or move forward, cannot go backward
  return toIndex >= fromIndex;
}

export function getNextStatuses(
  current: RequirementStatus
): RequirementStatus[] {
  const currentIndex = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER.slice(currentIndex + 1);
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/status.ts
git commit -m "feat: define TypeScript types and status/phase mappings"
```

---

### Task 3: Set up Supabase client and database schema

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/supabase-server.ts`
- Create: `schema.sql` (reference, run manually in Supabase dashboard)

- [ ] **Step 1: Create `lib/supabase.ts` (browser client)**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create `lib/supabase-server.ts` (server component client)**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component → ignore
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create `schema.sql`** (run this in Supabase SQL editor)

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (syncs with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('pm', 'boss', 'stakeholder')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Requirements table
CREATE TABLE requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  brief TEXT,
  description TEXT,
  prd_url TEXT,
  mockup_url TEXT,
  submitter_id UUID NOT NULL REFERENCES users(id),
  system TEXT[] DEFAULT '{}',
  module TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('P0', 'P1', 'P2', 'P3', 'P4')),
  deadline DATE,
  estimate NUMERIC,
  assignee_id UUID REFERENCES users(id),
  version TEXT,
  status TEXT NOT NULL DEFAULT '待跟进',
  phase INTEGER NOT NULL DEFAULT 1,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Operation logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  detail JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_requirements_phase ON requirements(phase);
CREATE INDEX idx_requirements_submitter ON requirements(submitter_id);
CREATE INDEX idx_comments_requirement ON comments(requirement_id);
CREATE INDEX idx_logs_requirement ON logs(requirement_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requirements_updated_at
  BEFORE UPDATE ON requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies: all authenticated users can read everything
CREATE POLICY "users_can_read_all" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "requirements_read_all" ON requirements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "comments_read_all" ON comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "logs_read_all" ON logs FOR SELECT USING (auth.role() = 'authenticated');

-- RLS: insert/update/delete policies per role
CREATE POLICY "anyone_can_insert_requirements" ON requirements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "pm_boss_update_requirements" ON requirements FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('pm', 'boss'))
);
CREATE POLICY "stakeholder_update_own" ON requirements FOR UPDATE USING (
  submitter_id = auth.uid() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'stakeholder')
);
CREATE POLICY "pm_boss_delete_requirements" ON requirements FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('pm', 'boss'))
);

CREATE POLICY "anyone_can_insert_comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "anyone_can_insert_logs" ON logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

- [ ] **Step 4: Create `.env.local` template**

```bash
cp -n .env.local .env.local.example 2>/dev/null; cat > .env.local.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
```

Note: User needs to create a Supabase project and run `schema.sql` in the SQL editor. Then copy `.env.local.example` to `.env.local` and fill in the values.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase.ts lib/supabase-server.ts schema.sql .env.local.example
git commit -m "feat: add Supabase client setup and database schema"
```

---

### Task 4: Set up authentication (login/logout)

**Files:**
- Create: `app/login/page.tsx`
- Create: `middleware.ts`
- Create: `app/api/auth/route.ts` (login endpoint)
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `app/api/auth/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  return NextResponse.json({ user: data.user });
}
```

- [ ] **Step 2: Create `middleware.ts`**

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 3: Create `app/login/page.tsx`**

```typescript
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
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">需求管理平台</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create placeholder `app/layout.tsx` (full version in Task 5)**

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "需求管理平台",
  description: "产品经理需求生命周期管理工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/login/page.tsx middleware.ts app/layout.tsx app/api/
git commit -m "feat: add authentication with login page and middleware"
```

---

### Task 5: Create Navbar, AuthGuard, and full layout

**Files:**
- Create: `components/Navbar.tsx`
- Create: `components/AuthGuard.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `components/Navbar.tsx`**

```typescript
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
    { href: "/table", label: "表格" },
    { href: "/requirements/new", label: "+ 新建需求" },
    ...(isAdmin ? [{ href: "/admin", label: "后台管理" }] : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
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
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
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
```

- [ ] **Step 2: Update `app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "需求管理平台",
  description: "产品经理需求生命周期管理工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx app/layout.tsx
git commit -m "feat: add Navbar with navigation and user menu"
```

---

### Task 6: Implement Requirements API

**Files:**
- Create: `app/api/requirements/route.ts`
- Create: `app/api/requirements/[id]/route.ts`

- [ ] **Step 1: Create `app/api/requirements/route.ts`** (GET list + POST create)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { CreateRequirementInput } from "@/lib/types";
import { getPhaseFromStatus } from "@/lib/status";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(request.url);

  const phase = searchParams.get("phase");
  const status = searchParams.get("status");
  const system = searchParams.get("system");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  let query = supabase
    .from("requirements")
    .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
    .order("created_at", { ascending: false });

  if (phase) query = query.eq("phase", Number(phase));
  if (status) query = query.eq("status", status);
  if (system) query = query.contains("system", [system]);
  if (priority) query = query.eq("priority", priority);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const body: CreateRequirementInput = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const phase = getPhaseFromStatus("待跟进");

  const { data, error } = await supabase
    .from("requirements")
    .insert({ ...body, submitter_id: user.id, status: "待跟进", phase })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: Create `app/api/requirements/[id]/route.ts`** (GET / PUT / DELETE)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { UpdateRequirementInput } from "@/lib/types";
import { getPhaseFromStatus, canTransition } from "@/lib/status";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("requirements")
    .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const body: UpdateRequirementInput = await request.json();

  // If status is changing, validate transition
  if (body.status) {
    const { data: current } = await supabase
      .from("requirements")
      .select("status")
      .eq("id", id)
      .single();
    if (current && !canTransition(current.status, body.status)) {
      return NextResponse.json(
        { error: "状态不可回退" },
        { status: 400 }
      );
    }
    body.phase = getPhaseFromStatus(body.status);
  }

  const { data, error } = await supabase
    .from("requirements")
    .update(body)
    .eq("id", id)
    .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("requirements").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/requirements/
git commit -m "feat: implement requirements CRUD API with status validation"
```

---

### Task 7: Implement Comments and Logs API

**Files:**
- Create: `app/api/comments/route.ts`
- Create: `app/api/logs/route.ts`

- [ ] **Step 1: Create `app/api/comments/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get("reqId");
  if (!reqId) return NextResponse.json({ error: "reqId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("comments")
    .select("*, user:users(*)")
    .eq("requirement_id", reqId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("comments")
    .insert({ requirement_id: body.requirement_id, user_id: user.id, content: body.content })
    .select("*, user:users(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: Create `app/api/logs/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get("reqId");
  if (!reqId) return NextResponse.json({ error: "reqId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("logs")
    .select("*, user:users(*)")
    .eq("requirement_id", reqId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/comments/ app/api/logs/
git commit -m "feat: implement comments and operation logs API"
```

---

### Task 8: Create shared UI components (badges)

**Files:**
- Create: `components/StatusBadge.tsx`
- Create: `components/PriorityBadge.tsx`
- Create: `components/SystemTags.tsx`

- [ ] **Step 1: Create `components/StatusBadge.tsx`**

```typescript
import { RequirementStatus } from "@/lib/types";
import { PHASE_STATUS_MAP, PhaseId } from "@/lib/status";

const phaseColors: Record<PhaseId, string> = {
  1: "bg-gray-100 text-gray-800",
  2: "bg-yellow-100 text-yellow-800",
  3: "bg-blue-100 text-blue-800",
  4: "bg-green-100 text-green-800",
};

function getPhaseForStatus(status: RequirementStatus): PhaseId {
  for (const [phase, statuses] of Object.entries(PHASE_STATUS_MAP)) {
    if (statuses.includes(status)) return Number(phase) as PhaseId;
  }
  return 1;
}

export default function StatusBadge({ status }: { status: RequirementStatus }) {
  const phase = getPhaseForStatus(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${phaseColors[phase]}`}>
      {status}
    </span>
  );
}
```

- [ ] **Step 2: Create `components/PriorityBadge.tsx`**

```typescript
import { Priority } from "@/lib/types";

const colors: Record<Priority, string> = {
  P0: "bg-red-100 text-red-800",
  P1: "bg-orange-100 text-orange-800",
  P2: "bg-blue-100 text-blue-800",
  P3: "bg-gray-100 text-gray-600",
  P4: "bg-gray-100 text-gray-400",
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[priority]}`}>
      {priority}
    </span>
  );
}
```

- [ ] **Step 3: Create `components/SystemTags.tsx`**

```typescript
import { SystemOption } from "@/lib/types";

const tagColors: Record<SystemOption, string> = {
  "HIFOOD 1.0": "bg-purple-100 text-purple-800",
  "HIFOOD 2.0": "bg-indigo-100 text-indigo-800",
  "SAP": "bg-cyan-100 text-cyan-800",
  "CRM": "bg-pink-100 text-pink-800",
  "AI": "bg-teal-100 text-teal-800",
};

export default function SystemTags({ systems }: { systems: SystemOption[] }) {
  if (!systems || systems.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {systems.map((sys) => (
        <span key={sys} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tagColors[sys] || "bg-gray-100 text-gray-600"}`}>
          {sys}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/StatusBadge.tsx components/PriorityBadge.tsx components/SystemTags.tsx
git commit -m "feat: add shared badge components for status, priority, and system tags"
```

---

### Task 9: Create Kanban board components

**Files:**
- Create: `components/KanbanCard.tsx`
- Create: `components/KanbanColumn.tsx`
- Create: `components/KanbanBoard.tsx`

- [ ] **Step 1: Create `components/KanbanCard.tsx`**

```typescript
import { Requirement } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import SystemTags from "./SystemTags";

export default function KanbanCard({ requirement }: { requirement: Requirement }) {
  return (
    <a
      href={`/requirements/${requirement.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{requirement.title}</h3>
      <div className="flex flex-wrap gap-1 mb-2">
        <PriorityBadge priority={requirement.priority} />
        <StatusBadge status={requirement.status} />
      </div>
      <SystemTags systems={requirement.system} />
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{requirement.submitter?.name || "未知"}</span>
        {requirement.deadline && <span>截止: {requirement.deadline}</span>}
      </div>
    </a>
  );
}
```

- [ ] **Step 2: Create `components/KanbanColumn.tsx`**

```typescript
import { Requirement, PhaseId } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/status";
import KanbanCard from "./KanbanCard";

interface Props {
  phase: PhaseId;
  requirements: Requirement[];
}

const bgColors: Record<PhaseId, string> = {
  1: "bg-gray-50",
  2: "bg-yellow-50",
  3: "bg-blue-50",
  4: "bg-green-50",
};

const headerColors: Record<PhaseId, string> = {
  1: "bg-gray-200 text-gray-800",
  2: "bg-yellow-200 text-yellow-800",
  3: "bg-blue-200 text-blue-800",
  4: "bg-green-200 text-green-800",
};

export default function KanbanColumn({ phase, requirements }: Props) {
  return (
    <div className={`flex-shrink-0 w-72 rounded-xl ${bgColors[phase]} p-3`}>
      <div className={`rounded-lg px-3 py-2 mb-3 font-medium text-sm ${headerColors[phase]}`}>
        {PHASE_LABELS[phase]}
        <span className="ml-2 text-xs opacity-70">({requirements.length})</span>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {requirements.map((req) => (
          <KanbanCard key={req.id} requirement={req} />
        ))}
        {requirements.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">暂无需求</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/KanbanBoard.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { Requirement, PhaseId } from "@/lib/types";
import { createClient } from "@/lib/supabase";
import KanbanColumn from "./KanbanColumn";
import FilterBar from "./FilterBar";

export default function KanbanBoard() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filtered, setFiltered] = useState<Requirement[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchRequirements = async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
        .order("created_at", { ascending: false });
      if (data) setRequirements(data);
    };
    fetchRequirements();
  }, [supabase]);

  // Apply filters to requirements and update filtered state
  useEffect(() => {
    setFiltered(requirements);
  }, [requirements]);

  const handleFilterChange = (filters: { search?: string; system?: string; priority?: string }) => {
    let result = requirements;
    if (filters.search) {
      result = result.filter((r) => r.title.includes(filters.search!));
    }
    if (filters.system) {
      result = result.filter((r) => r.system.includes(filters.system as any));
    }
    if (filters.priority) {
      result = result.filter((r) => r.priority === filters.priority);
    }
    setFiltered(result);
  };

  const phases: PhaseId[] = [1, 2, 3, 4];
  const grouped = phases.map((phase) => ({
    phase,
    items: filtered.filter((r) => r.phase === phase),
  }));

  return (
    <div>
      <FilterBar onFilterChange={handleFilterChange} />
      <div className="flex gap-4 overflow-x-auto pb-4 mt-4">
        {grouped.map(({ phase, items }) => (
          <KanbanColumn key={phase} phase={phase} requirements={items} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/KanbanBoard.tsx components/KanbanColumn.tsx components/KanbanCard.tsx
git commit -m "feat: add Kanban board with 4-phase columns and card display"
```

---

### Task 10: Create FilterBar component

**Files:**
- Create: `components/FilterBar.tsx`

- [ ] **Step 1: Create `components/FilterBar.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Priority, SystemOption } from "@/lib/types";

interface FilterValues {
  search?: string;
  system?: string;
  priority?: string;
}

const systems: SystemOption[] = ["HIFOOD 1.0", "HIFOOD 2.0", "SAP", "CRM", "AI"];
const priorities: Priority[] = ["P0", "P1", "P2", "P3", "P4"];

export default function FilterBar({ onFilterChange }: { onFilterChange: (f: FilterValues) => void }) {
  const [search, setSearch] = useState("");
  const [system, setSystem] = useState("");
  const [priority, setPriority] = useState("");

  const handleChange = () => {
    onFilterChange({
      search: search || undefined,
      system: system || undefined,
      priority: priority || undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
      <input
        type="text"
        placeholder="搜索需求标题..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setTimeout(handleChange, 0); }}
        className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={system}
        onChange={(e) => { setSystem(e.target.value); handleChange(); }}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">全部系统</option>
        {systems.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={priority}
        onChange={(e) => { setPriority(e.target.value); handleChange(); }}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">全部优先级</option>
        {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/FilterBar.tsx
git commit -m "feat: add filter bar with search, system, and priority filters"
```

---

### Task 11: Create RequirementForm component

**Files:**
- Create: `components/RequirementForm.tsx`

- [ ] **Step 1: Create `components/RequirementForm.tsx`**

```typescript
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

    const { error: err } = isEdit && initialData
      ? await supabase.from("requirements").update(form).eq("id", initialData.id)
      : await supabase.from("requirements").insert(form);

    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }
    router.push("/");
    router.refresh();
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
              className={`px-3 py-1.5 rounded-lg text-sm border ${
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
```

- [ ] **Step 2: Commit**

```bash
git add components/RequirementForm.tsx
git commit -m "feat: add requirement form component with all spec fields"
```

---

### Task 12: Create CommentSection and ActivityLog components

**Files:**
- Create: `components/CommentSection.tsx`
- Create: `components/ActivityLog.tsx`

- [ ] **Step 1: Create `components/CommentSection.tsx`**

```typescript
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
    await supabase.from("comments").insert({
      requirement_id: requirementId,
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
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span className="font-medium">{c.user?.name || "未知"}</span>
              <span>{new Date(c.created_at).toLocaleString("zh-CN")}</span>
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
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          发送
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/ActivityLog.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { LogEntry } from "@/lib/types";

export default function ActivityLog({ requirementId }: { requirementId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("logs")
        .select("*, user:users(*)")
        .eq("requirement_id", requirementId)
        .order("created_at", { ascending: false });
      if (data) setLogs(data);
    };
    fetchLogs();
  }, [supabase, requirementId]);

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-4">操作记录</h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-gray-700">{log.user?.name || "未知"}</span>
              {" "}
              <span className="text-gray-600">{log.action}</span>
              {log.detail?.from && log.detail?.to && (
                <span className="text-gray-500">
                  ：{log.detail.from as string} → {log.detail.to as string}
                </span>
              )}
              <div className="text-gray-400 text-xs mt-0.5">
                {new Date(log.created_at).toLocaleString("zh-CN")}
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-gray-400 text-sm">暂无记录</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/CommentSection.tsx components/ActivityLog.tsx
git commit -m "feat: add comment section and activity log components"
```

---

### Task 13: Create DataTable and ExportButton for table view

**Files:**
- Create: `components/DataTable.tsx`
- Create: `components/ExportButton.tsx`

- [ ] **Step 1: Create `components/DataTable.tsx`**

```typescript
"use client";

import { useState, useMemo } from "react";
import { Requirement, Priority, SystemOption } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import SystemTags from "./SystemTags";

type SortField = "title" | "priority" | "status" | "deadline" | "created_at";
type SortDir = "asc" | "desc";

export default function DataTable({ requirements }: { requirements: Requirement[] }) {
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    const filtered = requirements.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
    return filtered.sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [requirements, sortField, sortDir, search]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索需求..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                { key: "title", label: "需求标题" },
                { key: "priority", label: "优先级" },
                { key: "status", label: "状态" },
                { key: null, label: "所属系统" },
                { key: "deadline", label: "期望完成" },
                { key: null, label: "负责人" },
                { key: null, label: "版本" },
                { key: "created_at", label: "创建时间" },
              ].map((col) => (
                <th
                  key={col.label}
                  className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => col.key && toggleSort(col.key as SortField)}
                >
                  {col.label}
                  {col.key === sortField && (sortDir === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((req) => (
              <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={`/requirements/${req.id}`} className="text-blue-600 hover:underline font-medium">
                    {req.title}
                  </a>
                </td>
                <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                <td className="px-4 py-3"><SystemTags systems={req.system} /></td>
                <td className="px-4 py-3 text-gray-600">{req.deadline || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{req.assignee?.name || "-"}</td>
                <td className="px-4 py-3 text-gray-600">{req.version || "-"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(req.created_at).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="text-gray-400 text-center py-8">暂无数据</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/ExportButton.tsx`**

```typescript
"use client";

import { createClient } from "@/lib/supabase";

export default function ExportButton() {
  const handleExport = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("requirements")
      .select("*, submitter:users!requirements_submitter_id_fkey(name), assignee:users!requirements_assignee_id_fkey(name)");

    if (!data || data.length === 0) {
      alert("没有可导出的数据");
      return;
    }

    // Build CSV and download
    const headers = ["标题", "优先级", "状态", "所属系统", "所属模块", "期望完成", "负责人", "版本", "提出人", "创建时间"];
    const rows = data.map((r: any) => [
      r.title,
      r.priority,
      r.status,
      (r.system || []).join("; "),
      r.module || "",
      r.deadline || "",
      r.assignee?.name || "",
      r.version || "",
      r.submitter?.name || "",
      new Date(r.created_at).toLocaleDateString("zh-CN"),
    ]);

    const csv = [headers.join(","), ...rows.map((r: string[]) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `需求列表_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
    >
      导出 CSV
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/DataTable.tsx components/ExportButton.tsx
git commit -m "feat: add data table view and CSV export button"
```

---

### Task 14: Build all pages

**Files:**
- Modify: `app/page.tsx` (Kanban home)
- Create: `app/table/page.tsx`
- Create: `app/requirements/new/page.tsx`
- Create: `app/requirements/[id]/page.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/users/page.tsx`
- Create: `app/admin/settings/page.tsx`

- [ ] **Step 1: Create `app/page.tsx` (Kanban home)**

```typescript
import KanbanBoard from "@/components/KanbanBoard";

export default function HomePage() {
  return <KanbanBoard />;
}
```

- [ ] **Step 2: Create `app/table/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Requirement } from "@/lib/types";
import DataTable from "@/components/DataTable";
import ExportButton from "@/components/ExportButton";

export default function TablePage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
        .order("created_at", { ascending: false });
      if (data) setRequirements(data);
    };
    fetch();
  }, [supabase]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">表格视图</h1>
        <ExportButton />
      </div>
      <DataTable requirements={requirements} />
    </div>
  );
}
```

- [ ] **Step 3: Create `app/requirements/new/page.tsx`**

```typescript
import RequirementForm from "@/components/RequirementForm";

export default function NewRequirementPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">提交新需求</h1>
      <RequirementForm />
    </div>
  );
}
```

- [ ] **Step 4: Create `app/requirements/[id]/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Requirement as ReqType } from "@/lib/types";
import { STATUS_ORDER, canTransition, getPhaseFromStatus } from "@/lib/status";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import SystemTags from "@/components/SystemTags";
import CommentSection from "@/components/CommentSection";
import ActivityLog from "@/components/ActivityLog";

export default function RequirementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [req, setReq] = useState<ReqType | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("requirements")
        .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
        .eq("id", id)
        .single();
      if (data) setReq(data);
    };
    fetch();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("users").select("*").eq("id", data.user.id).single().then(
          ({ data: u }) => setCurrentUser(u)
        );
      }
    });
  }, [supabase, id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!req || !canTransition(req.status, newStatus as any)) {
      alert("状态不可回退");
      return;
    }
    const phase = getPhaseFromStatus(newStatus as any);
    const { error } = await supabase
      .from("requirements")
      .update({ status: newStatus, phase })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    // Log the status change
    await supabase.from("logs").insert({
      requirement_id: id,
      action: "变更状态",
      detail: { from: req.status, to: newStatus },
    });

    // Refresh
    const { data } = await supabase
      .from("requirements")
      .select("*, submitter:users!requirements_submitter_id_fkey(*), assignee:users!requirements_assignee_id_fkey(*)")
      .eq("id", id)
      .single();
    if (data) setReq(data);
  };

  if (!req) return <div className="text-center py-12 text-gray-500">加载中...</div>;

  const currentIndex = STATUS_ORDER.indexOf(req.status);
  const canEdit = currentUser?.role === "pm" || currentUser?.role === "boss";

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 返回
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{req.title}</h1>
          <div className="flex gap-2">
            <PriorityBadge priority={req.priority} />
            <StatusBadge status={req.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div><span className="text-gray-500">提出人：</span>{req.submitter?.name || "未知"}</div>
          <div><span className="text-gray-500">所属系统：</span><SystemTags systems={req.system} /></div>
          {req.module && <div><span className="text-gray-500">模块：</span>{req.module}</div>}
          {req.deadline && <div><span className="text-gray-500">期望完成：</span>{req.deadline}</div>}
          {req.assignee && <div><span className="text-gray-500">负责人：</span>{req.assignee.name}</div>}
          {req.version && <div><span className="text-gray-500">版本：</span>{req.version}</div>}
          {req.estimate && <div><span className="text-gray-500">预估工时/报价：</span>{req.estimate}</div>}
        </div>

        {canEdit && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">变更状态</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.slice(currentIndex).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={s === req.status}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    s === req.status
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  } disabled:opacity-50`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {req.brief && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-1">Brief</h3>
            <p className="text-gray-600">{req.brief}</p>
          </div>
        )}

        {req.description && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-1">需求描述</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{req.description}</p>
          </div>
        )}

        <div className="flex gap-4 text-sm">
          {req.prd_url && (
            <a href={req.prd_url} target="_blank" className="text-blue-600 hover:underline">查看 PRD →</a>
          )}
          {req.mockup_url && (
            <a href={req.mockup_url} target="_blank" className="text-blue-600 hover:underline">查看墨刀原型 →</a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <CommentSection requirementId={id} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <ActivityLog requirementId={id} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `app/admin/page.tsx`**

```typescript
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
```

- [ ] **Step 6: Create `app/admin/users/page.tsx`**

```typescript
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
    // Create auth user via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError || !authData.user) {
      alert(authError?.message || "创建失败");
      return;
    }
    // Create profile
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
    // Refresh
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
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
          <input
            type="password"
            placeholder="初始密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="stakeholder">需求方</option>
            <option value="pm">PM</option>
            <option value="boss">上级</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          添加
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">姓名</th>
              <th className="px-4 py-3 text-left text-gray-600">邮箱</th>
              <th className="px-4 py-3 text-left text-gray-600">角色</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
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
```

- [ ] **Step 7: Create `app/admin/settings/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import { SystemOption } from "@/lib/types";

const defaultSystems: SystemOption[] = ["HIFOOD 1.0", "HIFOOD 2.0", "SAP", "CRM", "AI"];

export default function AdminSettingsPage() {
  const [systems] = useState<SystemOption[]>(defaultSystems);
  const [newSystem, setNewSystem] = useState("");

  const handleAddSystem = () => {
    alert("功能开发中 - 系统选项将存储在数据库表中（二期实现）");
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">系统配置</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-4">所属系统选项</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {systems.map((s) => (
            <span key={s} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">{s}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSystem}
            onChange={(e) => setNewSystem(e.target.value)}
            placeholder="新系统名称"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button onClick={handleAddSystem} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            添加
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx app/table/ app/requirements/ app/admin/
git commit -m "feat: add all pages - kanban, table, requirement detail, admin"
```

---

### Task 15: Finalize and test

**Files:** (no new files)

- [ ] **Step 1: Verify project builds**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Verify lint**

```bash
npm run lint
```

Expected: No lint errors

- [ ] **Step 3: Final commit and summary**

```bash
git add .
git commit -m "chore: finalize PM requirement management tool v1"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| Next.js + Supabase + Vercel | Task 1, 3 |
| Four roles (pm/boss/stakeholder) | Task 4, 5 |
| 13 statuses in 4 phases | Task 2 |
| Status→Phase auto-mapping | Task 2 (lib/status.ts) |
| Forward-only status transitions | Task 2 (canTransition), Task 6 (PUT validation), Task 14 (UI) |
| Multi-select system (5 options) | Task 2 (types), Task 11 (form), Task 14 (pages) |
| All 15+ requirement fields | Task 2 (types), Task 11 (form) |
| Kanban board view | Task 9, 14 |
| Table view with sorting | Task 13, 14 |
| Excel/CSV export | Task 13 |
| Requirement detail page | Task 14 |
| Comments system | Task 7, 12 |
| Operation logs | Task 7, 12 |
| User management (admin) | Task 14 |
| Auth middleware | Task 4 |
| Responsive UI | Built into Tailwind classes |

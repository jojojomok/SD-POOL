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

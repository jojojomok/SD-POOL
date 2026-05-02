import { SystemOption } from "@/lib/types";

const tagColors: Record<SystemOption, string> = {
  "HIFOOD 1.0": "bg-blue-50 text-blue-600",
  "HIFOOD 2.0": "bg-indigo-50 text-indigo-600",
  "SAP": "bg-purple-50 text-purple-600",
  "CRM": "bg-green-50 text-green-600",
  "AI": "bg-cyan-50 text-cyan-600",
};

export default function SystemTags({ systems }: { systems: SystemOption[] }) {
  if (!systems || systems.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {systems.map((sys) => (
        <span key={sys} className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${tagColors[sys] || "bg-gray-100 text-gray-600"}`}>
          {sys}
        </span>
      ))}
    </div>
  );
}

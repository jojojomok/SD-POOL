export default function SystemTags({ systems }: { systems: string[] }) {
  if (!systems?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {systems.map((s) => (
        <span
          key={s}
          className="inline-flex px-[8px] py-[2px] rounded text-[11px] bg-[#f1f3f5] text-[#495057]"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

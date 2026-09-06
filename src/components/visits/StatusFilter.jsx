import { CheckCircle2, Circle, Clock3, ListFilter, XCircle } from "lucide-react";

const filters = [
  { value: "all", label: "All", icon: ListFilter },
  { value: "planned", label: "Planned", icon: Circle },
  { value: "in_progress", label: "In progress", icon: Clock3 },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
];

export default function StatusFilter({ value, onChange, counts = {} }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {filters.map((f) => (
        <FilterButton
          key={f.value}
          active={value === f.value}
          count={counts[f.value]}
          filter={f}
          onClick={() => onChange(f.value)}
        />
      ))}
    </div>
  );
}

function FilterButton({ active, count, filter, onClick }) {
  const Icon = filter.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
      aria-pressed={active}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{filter.label}</span>
      {typeof count === "number" && (
        <span
          className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

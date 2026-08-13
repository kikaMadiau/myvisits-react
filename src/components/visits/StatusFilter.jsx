const filters = [
  { value: "all", label: "All" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function StatusFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 pb-1">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            value === f.value
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-500 border border-gray-200"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
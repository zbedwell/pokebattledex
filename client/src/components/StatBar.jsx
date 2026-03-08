import { getStatColor } from "../utils/formatters.js";

export const StatBar = ({ label, value }) => {
  const percentage = Math.min(100, Math.round((value / 180) * 100));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-ink">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100">
        <div className={`h-2.5 rounded-full ${getStatColor(value)}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

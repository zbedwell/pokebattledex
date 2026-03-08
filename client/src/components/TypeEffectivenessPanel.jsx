export const TypeEffectivenessPanel = ({ title, items, tone = "danger" }) => {
  const toneClass =
    tone === "danger"
      ? "border-rose-200 bg-rose-50"
      : tone === "safe"
        ? "border-emerald-200 bg-emerald-50"
        : "border-slate-200 bg-slate-50";

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <h4 className="text-sm font-bold text-ink">{title}</h4>
      <p className="mt-1 text-sm text-slate-700">{items.length > 0 ? items.join(", ") : "None"}</p>
    </div>
  );
};

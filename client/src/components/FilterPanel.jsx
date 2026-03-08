export const FilterPanel = ({ title = "Filters", children, contentClassName = "" }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <div className={`mt-3 grid gap-3 ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
};

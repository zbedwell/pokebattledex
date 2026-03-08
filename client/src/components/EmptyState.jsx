export const EmptyState = ({ title, message }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-card">
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
    </div>
  );
};
